-- Delivery: completion state and delivery-note language
-- Run this in the Supabase SQL editor (or via `supabase db push`).

alter table public.delivery
    add column if not exists completed_at timestamptz null,
    add column if not exists pdf_language text not null default 'de';

comment on column public.delivery.completed_at is
    'Set when the goods were delivered (delivery is done/locked). NULL = open.';
comment on column public.delivery.pdf_language is
    'Language code (de, en, pl, nl, dk, ro, bg) used to render the delivery note PDF.';

alter table public.delivery
    add constraint delivery_pdf_language_check
    check (pdf_language in ('de', 'en', 'pl', 'nl', 'dk', 'ro', 'bg'));

create index if not exists delivery_completed_at_idx on public.delivery (completed_at);
