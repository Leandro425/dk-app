-- Payroll (Monatsabrechnung) module in the controlling area
-- Run this in the Supabase SQL editor (or via `supabase db push`).
--
-- Replaces the Python tool `dk-app-utils`, which relied on four functions that
-- exist only in the database (get_report_totals, get_timestamp_totals,
-- get_employee_reports_by_month, get_employee_timestamps_by_month). Those are
-- left untouched; the app uses the two versioned functions below instead.
--
--   1. employee.language  language of the employee's monthly statement PDF
--   2. admin-only update policy on employee (needed to set the language)
--   3. payroll_report_lines(month, year)  piecework lines of all employees
--   4. payroll_time_entries(month, year)  time entries of all employees with hours
--
-- Both functions run with the caller's rights (RLS applies) and additionally
-- refuse non-admin callers, because together with employee.pay_rate they
-- expose wage data.

-- 1. Statement language
alter table public.employee
    add column if not exists language text not null default 'de';

comment on column public.employee.language is
    'Language code (de, en, pl, nl, dk, ro, bg) used to render the employee''s monthly statement PDF.';

alter table public.employee
    drop constraint if exists employee_language_check;

alter table public.employee
    add constraint employee_language_check
    check (language in ('de', 'en', 'pl', 'nl', 'dk', 'ro', 'bg'));

-- 2. Admins may update employees (e.g. the statement language)
drop policy if exists "Admin update on employee" on public.employee;

create policy "Admin update on employee"
on public.employee
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 3. Piecework lines per employee, day, article and special feature
create or replace function public.payroll_report_lines(p_month integer, p_year integer)
returns table (
    employee_id bigint,
    report_date date,
    article_id bigint,
    article_external_id text,
    article_name text,
    piecework_wage numeric,
    special_feature text,
    not_charging_piecework_wage boolean,
    total_quantity numeric,
    report_count integer
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
    period_start date := make_date(p_year, p_month, 1);
begin
    if not public.is_admin() then
        raise exception 'Payroll data is restricted to administrators'
            using errcode = '42501';
    end if;

    return query
    select
        r.employee_id::bigint,
        r.date::date,
        a.id::bigint,
        a.external_id::text,
        a.name::text,
        coalesce(a.piecework_wage, 0)::numeric,
        r.special_feature::text,
        coalesce(r.not_charging_piecework_wage, false),
        coalesce(sum(r.quantity), 0)::numeric,
        count(*)::integer
    from public.report r
    join public.article a on a.id = r.article_id
    where r.date >= period_start
      and r.date < period_start + interval '1 month'
    group by
        r.employee_id, r.date, a.id, a.external_id, a.name, a.piecework_wage,
        r.special_feature, coalesce(r.not_charging_piecework_wage, false)
    order by r.employee_id, r.date, a.name;
end;
$$;

comment on function public.payroll_report_lines(integer, integer) is
    'Admin only. Reports of one month grouped per employee, day, article and special feature, with the article''s piecework wage.';

revoke all on function public.payroll_report_lines(integer, integer) from public;
grant execute on function public.payroll_report_lines(integer, integer) to authenticated;

-- 4. Time entries with computed work hours
create or replace function public.payroll_time_entries(p_month integer, p_year integer)
returns table (
    id bigint,
    employee_id bigint,
    entry_date date,
    start_time time,
    end_time time,
    break_in_min numeric,
    type text,
    work_hours numeric
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
    period_start date := make_date(p_year, p_month, 1);
begin
    if not public.is_admin() then
        raise exception 'Payroll data is restricted to administrators'
            using errcode = '42501';
    end if;

    return query
    select
        t.id::bigint,
        t.employee_id::bigint,
        t.date::date,
        t.start_time::time,
        t.end_time::time,
        coalesce(t.break_in_min, 0)::numeric,
        t.type::text,
        case
            when t.start_time is null or t.end_time is null then 0::numeric
            else greatest(
                0::numeric,
                (
                    extract(epoch from (
                        t.end_time::time - t.start_time::time
                        + case when t.end_time::time < t.start_time::time then interval '24 hours' else interval '0' end
                    )) / 3600.0
                    - coalesce(t.break_in_min, 0) / 60.0
                )::numeric
            )
        end
    from public.timestamp t
    where t.date >= period_start
      and t.date < period_start + interval '1 month'
    order by t.employee_id, t.date, t.start_time;
end;
$$;

comment on function public.payroll_time_entries(integer, integer) is
    'Admin only. Time entries of one month with work hours = end - start - break (entries crossing midnight are supported).';

revoke all on function public.payroll_time_entries(integer, integer) from public;
grant execute on function public.payroll_time_entries(integer, integer) to authenticated;
