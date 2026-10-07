-- Admin-only bulk import for the scraped MUJ faculty directory.
-- Called with the contents of scripts/data/muj-faculty.json; re-running it
-- refreshes existing rows (matched by MUJ id) and adds new ones.

create or replace function public.import_faculty(p_rows jsonb) returns int
language plpgsql security definer set search_path = ''
as $$
declare n int;
begin
  if not app_private.is_admin() then raise exception 'Administrators only.'; end if;

  insert into public.faculty (id, muj_id, full_name, designation, department, email, expertise, profile_url, source)
  select
    'muj-' || (r ->> 'muj_id'),
    r ->> 'muj_id',
    r ->> 'name',
    coalesce(nullif(r ->> 'designation', ''), 'Faculty'),
    coalesce(nullif(r ->> 'department', ''), 'Manipal University Jaipur'),
    coalesce(r ->> 'email', ''),
    coalesce(r ->> 'expertise', ''),
    r ->> 'profile_url',
    'muj'
  from jsonb_array_elements(p_rows) as r
  where coalesce(r ->> 'muj_id', '') <> '' and coalesce(r ->> 'name', '') <> ''
  on conflict (id) do update set
    full_name = excluded.full_name,
    designation = excluded.designation,
    department = excluded.department,
    email = excluded.email,
    expertise = excluded.expertise,
    profile_url = excluded.profile_url;

  get diagnostics n = row_count;
  return n;
end $$;

revoke execute on function public.import_faculty(jsonb) from public, anon;
grant execute on function public.import_faculty(jsonb) to authenticated;
