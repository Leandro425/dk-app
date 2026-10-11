-- Purchase batches get the prefix K (Kauf) instead of P: K-YYYY-NNNN.
-- Safe to run whether or not purchase batches already exist; existing P- numbers are renamed.
-- The counter (batch_number_counter) is keyed by type, so numbering just continues.

create or replace function public.format_batch_number(p_type text, p_year integer, p_seq integer)
returns text
language sql
immutable
as $$
    select format(
        '%s-%s-%s',
        case p_type when 'field' then 'F' when 'purchase' then 'K' end,
        p_year,
        lpad(p_seq::text, greatest(4, length(p_seq::text)), '0')
    );
$$;

-- protect_batch_number blocks changing batch_number, so lift it for the rename only
alter table public.batch disable trigger protect_batch_number;

update public.batch
set batch_number = 'K' || substr(batch_number, 2)
where type = 'purchase' and batch_number like 'P-%';

alter table public.batch enable trigger protect_batch_number;

comment on column public.batch.batch_number is
    'Own batch number F-YYYY-NNNN (field) or K-YYYY-NNNN (purchase), assigned on insert, never changes. Printed on the delivery note.';
