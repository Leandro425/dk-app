-- One-off data migration: mark all existing (open) deliveries as delivered,
-- using the delivery's creation timestamp as the completion time.
-- Requires 20260906120000_delivery_completed_at_pdf_language.sql to have been applied.

update public.delivery
set completed_at = created_at
where completed_at is null;
