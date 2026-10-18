-- Batch numbers drop the year: F-NNNN (field) / K-NNNN (purchase).
-- One counter per type that never resets. Existing batches are renumbered per type in
-- creation order, so the counter continues from the number of batches of that type.

-- 1. Formatting without the year
drop function public.format_batch_number(text, integer, integer);

create function public.format_batch_number(p_type text, p_seq integer)
returns text
language sql
immutable
as $$
    select format(
        '%s-%s',
        case p_type when 'field' then 'F' when 'purchase' then 'K' end,
        lpad(p_seq::text, greatest(4, length(p_seq::text)), '0')
    );
$$;

-- 2. Counter keyed by type only
alter table public.batch_number_counter drop constraint batch_number_counter_pkey;
delete from public.batch_number_counter;
alter table public.batch_number_counter drop column year;
alter table public.batch_number_counter add primary key (type);

comment on table public.batch_number_counter is
    'Last batch number used per type. Written only by the assign_batch_number trigger.';

-- 3. Renumber existing batches; protect_batch_number blocks changing batch_number, so lift it for this only
alter table public.batch disable trigger protect_batch_number;

with numbered as (
    select
        id,
        type,
        row_number() over (partition by type order by created_at, id)::integer as seq
    from public.batch
)
update public.batch b
set batch_number = public.format_batch_number(n.type, n.seq)
from numbered n
where n.id = b.id;

alter table public.batch enable trigger protect_batch_number;

insert into public.batch_number_counter (type, last_value)
select type, count(*)
from public.batch
group by type;

-- 4. Assign on insert from the per type counter
create or replace function public.assign_batch_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_seq integer;
begin
    insert into public.batch_number_counter (type, last_value)
    values (new.type, 1)
    on conflict (type) do update
    set last_value = batch_number_counter.last_value + 1
    returning last_value into v_seq;

    new.batch_number := public.format_batch_number(new.type, v_seq);
    return new;
end;
$$;

comment on column public.batch.batch_number is
    'Own batch number F-NNNN (field) or K-NNNN (purchase), assigned on insert, never changes. Printed on the delivery note.';
