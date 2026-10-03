-- Batches: the field table becomes batch, covering own fields and purchased goods
-- Run this in the Supabase SQL editor TOGETHER with deploying the frontend.
-- The old frontend stops working: it reads public.field and the field_id columns, which are renamed here.
--
-- Context: public.field was created in the dashboard (id, external_id, name, location) and is
-- not under version control. Nobody could create or change fields through the app.
-- A batch says where delivered goods come from, so every delivery note line can be traced back.
--
--   1. guard: refuses to run twice or while existing data would break the new constraints
--   2. rename field -> batch, location -> description, external_id -> external_number;
--      report.field_id / delivery_item.field_id -> batch_id
--   3. new columns: type ('field' | 'purchase'), batch_number, active
--   4. batch numbers F-YYYY-NNNN / P-YYYY-NNNN: counter per type and year, assigned by a trigger;
--      existing fields are numbered by their creation year, ordered by their old external_id
--   5. constraints; batch_number and type cannot change after insert
--   6. reports may only reference field batches (purchased goods are not worked on)
--   7. RLS: read stays open to all authenticated users; insert/update/delete admin only.
--      The foreign keys from report and delivery_item (no action) block deleting a batch
--      that is in use, so it can only be archived
--   8. dashboard quantity functions take p_batch_id instead of p_field_id

-- 1. Guard
do $$
declare
    problems text;
begin
    if to_regclass('public.field') is null then
        raise exception 'public.field does not exist. Was this migration already run?';
    end if;

    select string_agg(problem, E'\n') into problems
    from (
        select format('field %s: name is empty', id) as problem
        from public.field
        where nullif(trim(name), '') is null
    ) p;

    if problems is not null then
        raise exception E'Fix these field rows before running this migration:\n%', problems;
    end if;
end;
$$;

-- 2. Renames
alter table public.field rename to batch;
alter sequence public.field_id_seq rename to batch_id_seq;
alter table public.batch rename constraint field_pkey to batch_pkey;
alter policy "Authenticated select on field" on public.batch rename to "Authenticated select on batch";

alter table public.batch rename column location to description;
alter table public.batch rename column external_id to external_number;

alter table public.report rename column field_id to batch_id;
alter table public.report rename constraint report_field_id_fkey to report_batch_id_fkey;
alter table public.delivery_item rename column field_id to batch_id;
alter table public.delivery_item rename constraint delivery_item_field_id_fkey to delivery_item_batch_id_fkey;

create index if not exists report_batch_id_idx on public.report (batch_id);
create index if not exists delivery_item_batch_id_idx on public.delivery_item (batch_id);

-- 3. New columns (type gets a default only to fill the existing rows)
alter table public.batch
    add column type text not null default 'field',
    add column batch_number text,
    add column active boolean not null default true;

alter table public.batch alter column type drop default;

-- 4. Batch numbers
create or replace function public.format_batch_number(p_type text, p_year integer, p_seq integer)
returns text
language sql
immutable
as $$
    select format(
        '%s-%s-%s',
        case p_type when 'field' then 'F' when 'purchase' then 'P' end,
        p_year,
        lpad(p_seq::text, greatest(4, length(p_seq::text)), '0')
    );
$$;

create table public.batch_number_counter (
    type text not null,
    year integer not null,
    last_value integer not null,
    primary key (type, year)
);

comment on table public.batch_number_counter is
    'Last batch number used per type and year. Written only by the assign_batch_number trigger.';

-- No policies: only the security definer trigger function touches it.
alter table public.batch_number_counter enable row level security;
revoke all on table public.batch_number_counter from anon, authenticated;

with numbered as (
    select
        id,
        extract(year from created_at at time zone 'Europe/Berlin')::integer as year,
        row_number() over (
            partition by extract(year from created_at at time zone 'Europe/Berlin')
            order by external_number, id
        )::integer as seq
    from public.batch
)
update public.batch b
set batch_number = public.format_batch_number('field', n.year, n.seq)
from numbered n
where n.id = b.id;

insert into public.batch_number_counter (type, year, last_value)
select 'field', split_part(batch_number, '-', 2)::integer, count(*)
from public.batch
group by split_part(batch_number, '-', 2);

create or replace function public.assign_batch_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_year integer := extract(year from coalesce(new.created_at, now()) at time zone 'Europe/Berlin')::integer;
    v_seq integer;
begin
    insert into public.batch_number_counter (type, year, last_value)
    values (new.type, v_year, 1)
    on conflict (type, year) do update
    set last_value = batch_number_counter.last_value + 1
    returning last_value into v_seq;

    new.batch_number := public.format_batch_number(new.type, v_year, v_seq);
    return new;
end;
$$;

create trigger assign_batch_number
before insert on public.batch
for each row execute function public.assign_batch_number();

create or replace function public.protect_batch_number()
returns trigger
language plpgsql
as $$
begin
    if new.batch_number is distinct from old.batch_number or new.type is distinct from old.type then
        raise exception 'The batch number and type of batch % cannot be changed', old.id
            using errcode = '23514';
    end if;
    return new;
end;
$$;

create trigger protect_batch_number
before update of batch_number, type on public.batch
for each row execute function public.protect_batch_number();

-- 5. Constraints
alter table public.batch alter column external_number type text using external_number::text;
alter table public.batch alter column external_number drop not null;
alter table public.batch alter column name drop default;
alter table public.batch alter column description drop default;
alter table public.batch alter column batch_number set not null;

update public.batch set name = trim(name) where name <> trim(name);
update public.batch set description = nullif(trim(description), '')
where description is distinct from nullif(trim(description), '');

create unique index batch_batch_number_key on public.batch (batch_number);

alter table public.batch
    add constraint batch_type_check check (type in ('field', 'purchase'));

alter table public.batch
    add constraint batch_name_check check (trim(name) <> '');

comment on table public.batch is
    'Origin of goods: an own field (type field) or a purchase (type purchase). Shown per line on the delivery note.';
comment on column public.batch.batch_number is
    'Own batch number F-YYYY-NNNN (field) or P-YYYY-NNNN (purchase), assigned on insert, never changes. Printed on the delivery note.';
comment on column public.batch.external_number is
    'Number from outside: the old field number, or the supplier''s lot / delivery note number. Search only, not printed.';
comment on column public.batch.active is
    'Archived batches (false) are no longer offered in the report and delivery pickers but stay on existing entries.';

-- 6. Reports only on field batches
create or replace function public.check_report_batch_type()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if exists (select 1 from public.batch where id = new.batch_id and type <> 'field') then
        raise exception 'Reports can only reference field batches, batch % is a purchase', new.batch_id
            using errcode = '23514';
    end if;
    return new;
end;
$$;

create trigger check_report_batch_type
before insert or update of batch_id on public.report
for each row execute function public.check_report_batch_type();

-- 7. RLS (the select policy was renamed above)
drop policy if exists "Admin insert on batch" on public.batch;
create policy "Admin insert on batch"
on public.batch
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admin update on batch" on public.batch;
create policy "Admin update on batch"
on public.batch
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin delete on batch" on public.batch;
create policy "Admin delete on batch"
on public.batch
for delete
to authenticated
using (public.is_admin());

-- 8. Dashboard quantities (parameter names cannot change in place)
drop function if exists public.get_delivery_total_quantity(integer, integer, integer);
drop function if exists public.get_report_total_quantity(integer, integer, integer);

create function public.get_delivery_total_quantity(
    p_order_id bigint default null,
    p_batch_id bigint default null,
    p_article_id bigint default null
)
returns numeric
language sql
stable
set search_path = public
as $$
    select coalesce(sum(quantity), 0)
    from public.delivery_item
    where (batch_id = p_batch_id or p_batch_id is null)
      and (order_id = p_order_id or p_order_id is null)
      and (article_id = p_article_id or p_article_id is null);
$$;

create function public.get_report_total_quantity(
    p_order_id bigint default null,
    p_batch_id bigint default null,
    p_article_id bigint default null
)
returns numeric
language sql
stable
set search_path = public
as $$
    select coalesce(sum(quantity), 0)
    from public.report
    where (batch_id = p_batch_id or p_batch_id is null)
      and (order_id = p_order_id or p_order_id is null)
      and (article_id = p_article_id or p_article_id is null);
$$;

revoke all on function public.get_delivery_total_quantity(bigint, bigint, bigint) from public;
revoke all on function public.get_report_total_quantity(bigint, bigint, bigint) from public;
grant execute on function public.get_delivery_total_quantity(bigint, bigint, bigint) to authenticated;
grant execute on function public.get_report_total_quantity(bigint, bigint, bigint) to authenticated;
