-- New article unit: HB.
alter table public.article drop constraint if exists article_unit_check;
alter table public.article
    add constraint article_unit_check check (unit in ('piece', 'kg', 'crate', 'box', 'pallet', 'bunch', 'hb'));
