-- Controlling (admin) area: access helper and protection of supervisor.is_admin
-- Run this in the Supabase SQL editor (or via `supabase db push`).
--
-- Context: the previous "Authenticated update on supervisor" policy allowed ANY
-- authenticated user to update ANY supervisor row, including is_admin. This
-- migration
--   1. adds public.is_admin() as a reusable check for future admin-only policies,
--   2. restricts supervisor updates to the owner or an admin,
--   3. adds a trigger so only admins can change is_admin and no admin can
--      remove their own flag (self lock-out). Direct SQL editor / service-role
--      updates (no auth.uid()) are not affected by the trigger.
-- Existing admin-or-owner policies on report, delivery and timestamp are left as they are.

-- 1. Helper: is the current user an admin supervisor?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.supervisor s
        where s.user_id = (select auth.uid())
          and s.is_admin = true
    );
$$;

comment on function public.is_admin() is
    'True when the calling user is a supervisor with is_admin = true. Use in RLS policies for admin-only access.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 2. Supervisor update: owner or admin only
drop policy if exists "Authenticated update on supervisor" on public.supervisor;

create policy "Supervisor owner or admin update"
on public.supervisor
for update
to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

-- 3. Trigger: protect is_admin
create or replace function public.protect_supervisor_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    caller uuid := (select auth.uid());
begin
    -- Not an API request (SQL editor, service role, migrations): allow.
    if caller is null then
        return new;
    end if;

    if new.is_admin is distinct from old.is_admin then
        if not public.is_admin() then
            raise exception 'Only administrators can change is_admin'
                using errcode = '42501';
        end if;

        if old.user_id = caller and old.is_admin = true and new.is_admin = false then
            raise exception 'Administrators cannot remove their own admin flag'
                using errcode = '42501';
        end if;
    end if;

    return new;
end;
$$;

drop trigger if exists protect_supervisor_is_admin on public.supervisor;

create trigger protect_supervisor_is_admin
before update of is_admin on public.supervisor
for each row
execute function public.protect_supervisor_is_admin();
