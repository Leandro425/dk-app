-- Employees module in the controlling area, step 2 of 2
-- Applied on 2026-09-27 via the Supabase SQL editor, after 20260927120000_employee_private.sql.
-- Must only run once the frontend that reads employee_private is deployed; it was kept
-- outside supabase/migrations until then so `supabase db push` would not apply it early.
--
-- Drops the sensitive columns from public.employee. Their data was copied to
-- public.employee_private in step 1 and is maintained there since. After this,
-- "Authenticated select on employee" only exposes staff numbers, names, staff group,
-- statement language and entry/exit dates.
--
-- No CASCADE on purpose: if a view still depends on one of these columns the
-- statement fails instead of silently dropping the view. Functions are not
-- checked by Postgres; the legacy dk-app-utils functions (get_employee_reports_by_month
-- etc.) are no longer used by the app.

alter table public.employee
    drop column if exists address_street,
    drop column if exists address_house_number,
    drop column if exists address_zip_code,
    drop column if exists address_city,
    drop column if exists birthday,
    drop column if exists place_of_birth,
    drop column if exists country_of_birth,
    drop column if exists nationality,
    drop column if exists gender,
    drop column if exists marital_status,
    drop column if exists children,
    drop column if exists job_title,
    drop column if exists contract_type,
    drop column if exists pay_type,
    drop column if exists standard_pay,
    drop column if exists pay_rate,
    drop column if exists pay_rate_valid_from,
    drop column if exists social_security_number,
    drop column if exists tax_id;
