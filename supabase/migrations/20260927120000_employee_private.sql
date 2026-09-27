-- Employees module in the controlling area, step 1 of 2
-- Run this in the Supabase SQL editor (or via `supabase db push`) BEFORE deploying the frontend.
--
-- Context: the policy "Authenticated select on employee" lets every signed-in
-- supervisor read the whole employee row, including social security number,
-- tax id, address, birthday and pay. This migration moves those fields into
-- public.employee_private, which only admins can read or write.
--
--   1. guard: refuses to run while existing data would break the new constraints
--   2. employee_private (1:1 with employee), filled from the current columns ('' becomes null)
--   3. RLS: admin-only access to employee_private; admin-only insert/delete on employee
--   4. constraints: exit_date >= entry_date, staff_number_dk unique when set
--   5. save_employee(p_id, p_employee, p_private)  admin-only atomic create/update of both rows
--
-- The sensitive columns stay on public.employee for now, so the old frontend keeps
-- working until the new one is deployed. Step 2 (20260927130000_employee_drop_private_columns.sql)
-- drops them afterwards.

-- 1. Guard
do $$
declare
    problems text;
begin
    select string_agg(problem, E'\n') into problems
    from (
        select format('employee %s: exit_date %s is before entry_date %s', id, exit_date, entry_date) as problem
        from public.employee
        where exit_date < entry_date
        union all
        select format('employee %s: children = %s', id, children)
        from public.employee
        where children < 0
        union all
        select format('employee %s: gender %L is not one of m, w, d', id, gender)
        from public.employee
        where nullif(trim(gender), '') not in ('m', 'w', 'd')
        union all
        select format('employee %s: marital_status %L is not allowed', id, marital_status)
        from public.employee
        where nullif(trim(marital_status), '') not in
            ('ledig', 'verheiratet', 'verwitwet', 'geschieden', 'eingetragene Lebenspartnerschaft')
        union all
        select format('employee %s: contract_type %L is not allowed', id, contract_type)
        from public.employee
        where nullif(trim(contract_type), '') not in ('unbefristet', 'befristet', 'Zweckbefristet')
        union all
        select format('staff_number_dk %s is used by employees %s', staff_number_dk, string_agg(id::text, ', '))
        from public.employee
        where staff_number_dk is not null
        group by staff_number_dk
        having count(*) > 1
    ) p;

    if problems is not null then
        raise exception E'Fix these employee rows before running this migration:\n%', problems;
    end if;
end;
$$;

-- 2. Private employee data
create table if not exists public.employee_private (
    employee_id bigint primary key references public.employee(id) on delete cascade,
    address_street text,
    address_house_number text,
    address_zip_code text,
    address_city text,
    birthday date,
    place_of_birth text,
    country_of_birth text,
    nationality bigint,
    gender text,
    marital_status text,
    children bigint,
    job_title text,
    contract_type text,
    pay_type text,
    standard_pay text,
    pay_rate numeric,
    pay_rate_valid_from date,
    social_security_number text,
    tax_id text,
    updated_at timestamp with time zone not null default now(),
    constraint employee_private_gender_check check (gender in ('m', 'w', 'd')),
    constraint employee_private_marital_status_check check (
        marital_status in ('ledig', 'verheiratet', 'verwitwet', 'geschieden', 'eingetragene Lebenspartnerschaft')
    ),
    constraint employee_private_contract_type_check check (
        contract_type in ('unbefristet', 'befristet', 'Zweckbefristet')
    ),
    constraint employee_private_children_check check (children >= 0)
);

comment on table public.employee_private is
    'Admin only. Personal, tax and pay data of an employee (1:1 with employee).';
comment on column public.employee_private.nationality is
    'Destatis nationality code (Staatsangehoerigkeitsschluessel), e.g. 0 = German, 152 = Polish.';

insert into public.employee_private (
    employee_id, address_street, address_house_number, address_zip_code, address_city,
    birthday, place_of_birth, country_of_birth, nationality, gender, marital_status, children,
    job_title, contract_type, pay_type, standard_pay, pay_rate, pay_rate_valid_from,
    social_security_number, tax_id
)
select
    e.id,
    nullif(trim(e.address_street), ''),
    nullif(trim(e.address_house_number), ''),
    nullif(trim(e.address_zip_code), ''),
    nullif(trim(e.address_city), ''),
    e.birthday,
    nullif(trim(e.place_of_birth), ''),
    nullif(trim(e.country_of_birth), ''),
    e.nationality,
    nullif(trim(e.gender), ''),
    nullif(trim(e.marital_status), ''),
    e.children,
    nullif(trim(e.job_title), ''),
    nullif(trim(e.contract_type), ''),
    nullif(trim(e.pay_type), ''),
    nullif(trim(e.standard_pay), ''),
    e.pay_rate,
    e.pay_rate_valid_from,
    nullif(trim(e.social_security_number), ''),
    nullif(trim(e.tax_id), '')
from public.employee e
on conflict (employee_id) do nothing;

-- 3. RLS
alter table public.employee_private enable row level security;

drop policy if exists "Admin select on employee_private" on public.employee_private;
create policy "Admin select on employee_private"
on public.employee_private
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admin insert on employee_private" on public.employee_private;
create policy "Admin insert on employee_private"
on public.employee_private
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admin update on employee_private" on public.employee_private;
create policy "Admin update on employee_private"
on public.employee_private
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin delete on employee_private" on public.employee_private;
create policy "Admin delete on employee_private"
on public.employee_private
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admin insert on employee" on public.employee;
create policy "Admin insert on employee"
on public.employee
for insert
to authenticated
with check (public.is_admin());

-- Employees with reports or timestamps cannot be deleted: the foreign keys on
-- report.employee_id and timestamp.employee_id block it.
drop policy if exists "Admin delete on employee" on public.employee;
create policy "Admin delete on employee"
on public.employee
for delete
to authenticated
using (public.is_admin());

-- 4. Constraints on employee
alter table public.employee
    drop constraint if exists employee_exit_after_entry_check;

alter table public.employee
    add constraint employee_exit_after_entry_check
    check (exit_date is null or entry_date is null or exit_date >= entry_date);

create unique index if not exists employee_staff_number_dk_key
    on public.employee (staff_number_dk)
    where staff_number_dk is not null;

-- 5. Atomic save of employee + employee_private
create or replace function public.save_employee(p_id bigint, p_employee jsonb, p_private jsonb)
returns bigint
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
    v_id bigint := p_id;
    e public.employee;
    p public.employee_private;
begin
    if not public.is_admin() then
        raise exception 'Employee data is restricted to administrators'
            using errcode = '42501';
    end if;

    e := jsonb_populate_record(null::public.employee, p_employee);
    p := jsonb_populate_record(null::public.employee_private, p_private);

    if v_id is null then
        insert into public.employee (
            staff_number, staff_number_dk, firstname, lastname, staff_group_id, language, entry_date, exit_date
        )
        values (
            e.staff_number, e.staff_number_dk, e.firstname, e.lastname, e.staff_group_id,
            coalesce(e.language, 'de'), e.entry_date, e.exit_date
        )
        returning id into v_id;
    else
        update public.employee
        set staff_number = e.staff_number,
            staff_number_dk = e.staff_number_dk,
            firstname = e.firstname,
            lastname = e.lastname,
            staff_group_id = e.staff_group_id,
            language = coalesce(e.language, 'de'),
            entry_date = e.entry_date,
            exit_date = e.exit_date
        where id = v_id;

        if not found then
            raise exception 'Employee % not found', v_id
                using errcode = 'P0002';
        end if;
    end if;

    insert into public.employee_private (
        employee_id, address_street, address_house_number, address_zip_code, address_city,
        birthday, place_of_birth, country_of_birth, nationality, gender, marital_status, children,
        job_title, contract_type, pay_type, standard_pay, pay_rate, pay_rate_valid_from,
        social_security_number, tax_id, updated_at
    )
    values (
        v_id, p.address_street, p.address_house_number, p.address_zip_code, p.address_city,
        p.birthday, p.place_of_birth, p.country_of_birth, p.nationality, p.gender, p.marital_status, p.children,
        p.job_title, p.contract_type, p.pay_type, p.standard_pay, p.pay_rate, p.pay_rate_valid_from,
        p.social_security_number, p.tax_id, now()
    )
    on conflict (employee_id) do update
    set address_street = excluded.address_street,
        address_house_number = excluded.address_house_number,
        address_zip_code = excluded.address_zip_code,
        address_city = excluded.address_city,
        birthday = excluded.birthday,
        place_of_birth = excluded.place_of_birth,
        country_of_birth = excluded.country_of_birth,
        nationality = excluded.nationality,
        gender = excluded.gender,
        marital_status = excluded.marital_status,
        children = excluded.children,
        job_title = excluded.job_title,
        contract_type = excluded.contract_type,
        pay_type = excluded.pay_type,
        standard_pay = excluded.standard_pay,
        pay_rate = excluded.pay_rate,
        pay_rate_valid_from = excluded.pay_rate_valid_from,
        social_security_number = excluded.social_security_number,
        tax_id = excluded.tax_id,
        updated_at = now();

    return v_id;
end;
$$;

comment on function public.save_employee(bigint, jsonb, jsonb) is
    'Admin only. Creates (p_id null) or fully replaces an employee and its employee_private row in one transaction. Returns the employee id.';

revoke all on function public.save_employee(bigint, jsonb, jsonb) from public;
grant execute on function public.save_employee(bigint, jsonb, jsonb) to authenticated;
