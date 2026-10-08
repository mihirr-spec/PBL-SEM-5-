-- Presentation demo: three test logins, teams of 2–3, and weekly-report slots.
--
--   mihirtest@university.edu        Mihir Sanghvi (2427010544)   password 123
--   krishnatest@university.edu      Krishna Agarwal (2427010030) password 123
--   testsupervisor@muj.manipal.edu  Test Supervisor (teacher)    password 123
--
-- Test logins are listed in app_private.test_accounts; the sign-up trigger
-- links them to their records instead of applying the MUJ address rules.
-- (The old demo data cleared here is put back by the next migration.)

delete from public.announcements;
delete from public.groups;
delete from public.student_grades;
delete from public.notifications;
delete from auth.users where email ilike '%@university.edu.in';
delete from public.students;
delete from legacy.projects;
delete from public.faculty where source = 'demo';

-- ------------------------------------------------------------ test logins

create table app_private.test_accounts (
  email text primary key check (email = lower(email)),
  student_id text references public.students (id) on delete cascade,
  faculty_id text references public.faculty (id) on delete cascade,
  check ((student_id is null) <> (faculty_id is null))
);

create or replace function app_private.link_test_account(new_id uuid, em text) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare t app_private.test_accounts;
begin
  select * into t from app_private.test_accounts where email = em;
  if t.email is null then return false; end if;
  if t.student_id is not null then
    update public.students set user_id = new_id where id = t.student_id;
    insert into public.profiles (id, email, role, display_name, profile_id)
    select new_id, em, 'student', full_name, id from public.students where id = t.student_id;
  else
    update public.faculty set user_id = new_id where id = t.faculty_id;
    insert into public.profiles (id, email, role, display_name, profile_id)
    select new_id, em, 'faculty', full_name, id from public.faculty where id = t.faculty_id;
  end if;
  return true;
end $$;
revoke execute on function app_private.link_test_account from public, anon, authenticated;

-- Same rules as before, with test logins checked first.
create or replace function app_private.on_auth_user_created() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  em text := lower(trim(new.email));
  meta jsonb := coalesce(new.raw_user_meta_data, '{}');
  f public.faculty;
  s public.students;
  email_reg text;
  reg text;
  start_year int;
  term_start int;
begin
  if app_private.link_test_account(new.id, em) then return new; end if;

  if em like '%@jaipur.manipal.edu' then
    if exists (select 1 from app_private.admin_emails where email = em) then
      insert into public.profiles (id, email, role, display_name, profile_id)
      values (new.id, em, 'admin',
        coalesce((select full_name from public.faculty where lower(email) = em limit 1),
                 nullif(trim(meta ->> 'full_name'), ''), 'PBL Office'),
        'admin');
      return new;
    end if;

    select * into f from public.faculty
    where lower(email) = em and user_id is null
    order by id limit 1 for update;
    if f.id is null then
      raise exception 'No MUJ faculty record has the address %. Contact the PBL office.', em;
    end if;
    update public.faculty set user_id = new.id where id = f.id;
    insert into public.profiles (id, email, role, display_name, profile_id)
    values (new.id, em, 'faculty', f.full_name, f.id);
    return new;
  end if;

  if em not like '%@muj.manipal.edu' then
    raise exception 'Use your university email: name.registrationno@muj.manipal.edu.';
  end if;

  email_reg := substring(split_part(em, '@', 1) from '(\d{6,})$');

  select * into s from public.students where lower(university_email) = em for update;
  if s.id is null and email_reg is not null then
    select * into s from public.students where registration_number = email_reg for update;
  end if;

  if s.id is not null then
    if s.user_id is not null then
      raise exception 'An account already exists for this student.';
    end if;
    update public.students set user_id = new.id, university_email = em where id = s.id
    returning * into s;
  else
    reg := coalesce(email_reg, nullif(upper(trim(meta ->> 'registration_number')), ''));
    if reg is null then raise exception 'Your registration number is required.'; end if;
    if exists (select 1 from public.students where registration_number = reg) then
      raise exception 'Registration number % is already registered.', reg;
    end if;

    start_year := case when reg ~ '^\d{2}' then 2000 + left(reg, 2)::int
                       else extract(year from now())::int end;
    term_start := (extract(year from now())::int - start_year) * 2
                  + case when extract(month from now()) >= 7 then 1 else 0 end;

    insert into public.students (
      id, user_id, full_name, registration_number, university_email,
      programme, branch, specialization, semester, section, batch
    ) values (
      's-' || reg, new.id,
      coalesce(nullif(trim(meta ->> 'full_name'), ''), initcap(split_part(split_part(em, '@', 1), '.', 1))),
      reg, em,
      coalesce(nullif(trim(meta ->> 'programme'), ''), 'B.Tech'),
      coalesce(nullif(trim(meta ->> 'branch'), ''), 'Computer Science & Engineering'),
      coalesce(trim(meta ->> 'specialization'), ''),
      coalesce(nullif(meta ->> 'semester', '')::int, greatest(1, least(8, term_start))),
      upper(coalesce(trim(meta ->> 'section'), '')),
      start_year || ' – ' || (start_year + 4)
    )
    returning * into s;
  end if;

  insert into public.profiles (id, email, role, display_name, profile_id)
  values (new.id, em, 'student', s.full_name, s.id);

  perform app_private.notify(array[new.id], 'group',
    l.full_name || ' has invited you to join ' || g.name, g.project_title, '/student/requests')
  from public.group_invitations i
  join public.groups g on g.id = i.group_id
  join public.students l on l.id = i.invited_by
  where i.student_id = s.id and i.status = 'pending';

  return new;
end $$;

insert into public.faculty (id, full_name, faculty_code, department, designation, email, expertise, source)
values ('test-supervisor', 'Test Supervisor', 'TEST-001', 'Computer Science & Engineering',
        'Assistant Professor', 'testsupervisor@muj.manipal.edu', 'Demo supervisor for the PBL portal', 'demo');

insert into public.students (id, full_name, registration_number, university_email, programme, branch, semester, section, batch)
values
  ('s-2427010544', 'Mihir Sanghvi', '2427010544', 'mihir.2427010544@muj.manipal.edu',
   'B.Tech', 'Computer Science & Engineering', 5, '', '2024 – 2028'),
  ('s-2427010030', 'Krishna Agarwal', '2427010030', 'krishna.2427010030@muj.manipal.edu',
   'B.Tech', 'Computer Science & Engineering', 5, '', '2024 – 2028');

insert into app_private.test_accounts (email, student_id, faculty_id) values
  ('mihirtest@university.edu', 's-2427010544', null),
  ('krishnatest@university.edu', 's-2427010030', null),
  ('testsupervisor@muj.manipal.edu', null, 'test-supervisor');

with accounts (id, email) as (
  values
    ('b2000000-0000-4000-8000-000000000001'::uuid, 'mihirtest@university.edu'),
    ('b2000000-0000-4000-8000-000000000002'::uuid, 'krishnatest@university.edu'),
    ('b2000000-0000-4000-8000-000000000003'::uuid, 'testsupervisor@muj.manipal.edu')
)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
select '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
  extensions.crypt('123', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
from accounts;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.id in ('b2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002',
               'b2000000-0000-4000-8000-000000000003');

-- ------------------------------------------------------ teams of 2 to 3

create or replace function app_private.invite_student(gid uuid, p_reg text, p_name text default null) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  g public.groups;
  s public.students;
  reg text := upper(trim(p_reg));
  leader_name text;
begin
  select * into g from public.groups where id = gid;
  select * into s from public.students where upper(registration_number) = reg;
  if s.id is null then
    raise exception 'No student with registration number % is registered yet.', reg;
  end if;
  -- The typed name must start like the roster name, to catch a mistyped number.
  if coalesce(trim(p_name), '') <> ''
     and lower(split_part(trim(p_name), ' ', 1)) <> lower(split_part(trim(s.full_name), ' ', 1)) then
    raise exception 'Registration number % belongs to %, not %.', reg, s.full_name, trim(p_name);
  end if;
  if s.id = g.leader_student_id then raise exception 'You are already in this group.'; end if;
  if exists (select 1 from public.group_members where student_id = s.id) then
    raise exception '% (%) is already in a group.', s.full_name, reg;
  end if;
  if exists (select 1 from public.group_invitations
             where group_id = gid and student_id = s.id and status = 'pending') then
    raise exception '% has already been invited.', s.full_name;
  end if;
  if (select count(*) from public.group_members where group_id = gid)
     + (select count(*) from public.group_invitations where group_id = gid and status = 'pending') >= 3 then
    raise exception 'A team has at most 3 students, counting pending invitations.';
  end if;

  insert into public.group_invitations (group_id, student_id, invited_by)
  values (gid, s.id, g.leader_student_id);

  leader_name := (select full_name from public.students where id = g.leader_student_id);
  perform app_private.notify(array[s.user_id], 'group',
    leader_name || ' has invited you to join ' || g.name, g.project_title, '/student/requests');
end $$;
drop function app_private.invite_student(uuid, text);
revoke execute on function app_private.invite_student from public, anon, authenticated;

-- Team lead plus one or two teammates, each given by name and registration number.
drop function public.create_group(text, text, text, text, text[]);
create function public.create_group(
  p_name text, p_project_title text, p_project_idea text, p_domain text,
  p_member_regs text[], p_member_names text[] default null
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  me text := app_private.my_student_id();
  gid uuid;
  n int := coalesce(array_length(p_member_regs, 1), 0);
begin
  if me is null then raise exception 'Only students can create groups.'; end if;
  if exists (select 1 from public.group_members where student_id = me) then
    raise exception 'You are already in a group.';
  end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_project_title), '') = '' then
    raise exception 'Give your project a title.';
  end if;
  if n < 1 or n > 2 then
    raise exception 'A team has 2 or 3 students: you plus one or two teammates.';
  end if;

  insert into public.groups (name, project_title, project_idea, domain, leader_student_id)
  values (trim(p_name), trim(p_project_title), coalesce(p_project_idea, ''), coalesce(p_domain, ''), me)
  returning id into gid;
  insert into public.group_members (group_id, student_id, team_role) values (gid, me, 'Team Lead');

  update public.group_invitations set status = 'cancelled', decided_at = now()
  where student_id = me and status = 'pending';

  for i in 1 .. n loop
    perform app_private.invite_student(gid, p_member_regs[i], p_member_names[i]);
  end loop;
  return gid;
end $$;

create or replace function public.invite_member(p_reg text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform app_private.invite_student(app_private.require_leader(), p_reg, null);
end $$;

create or replace function public.respond_to_invitation(p_invitation uuid, p_accept boolean) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  me text := app_private.my_student_id();
  i public.group_invitations;
  g public.groups;
  my_name text := (select full_name from public.students where id = me);
begin
  select * into i from public.group_invitations where id = p_invitation for update;
  if i.id is null or i.student_id is distinct from me then raise exception 'Invitation not found.'; end if;
  if i.status <> 'pending' then raise exception 'This invitation is no longer open.'; end if;
  select * into g from public.groups where id = i.group_id for update;

  if not p_accept then
    update public.group_invitations set status = 'declined', decided_at = now() where id = i.id;
    perform app_private.notify(array[(select user_id from public.students where id = g.leader_student_id)],
      'group', my_name || ' declined your invitation', g.name, '/student/group');
    return 'declined';
  end if;

  if exists (select 1 from public.group_members where student_id = me) then
    raise exception 'You are already in a group.';
  end if;
  if (select count(*) from public.group_members where group_id = g.id) >= 3 then
    raise exception 'This team is already full.';
  end if;

  insert into public.group_members (group_id, student_id) values (g.id, me);
  update public.group_invitations set status = 'accepted', decided_at = now() where id = i.id;
  update public.group_invitations set status = 'cancelled', decided_at = now()
  where student_id = me and status = 'pending';

  perform app_private.notify(
    array(select s.user_id from public.group_members gm join public.students s on s.id = gm.student_id
          where gm.group_id = g.id and gm.student_id <> me),
    'group', my_name || ' joined ' || g.name, g.project_title, '/student/group');
  return 'accepted';
end $$;

revoke execute on function public.create_group from public, anon;
grant execute on function public.create_group to authenticated;

-- ------------------------------------------------- weekly-report slots

alter table public.groups
  add column report_count int not null default 5 check (report_count between 1 and 10);

-- Reports open once a supervisor has approved the group, one per slot.
create policy "reports need a supervisor and a free slot" on public.weekly_reports
  as restrictive for insert to authenticated
  with check (
    exists (select 1 from public.groups g
            where g.id = group_id and g.mentor_id is not null and week <= g.report_count)
  );

-- Progress = share of the report slots submitted.
create or replace function app_private.refresh_progress(gid uuid) returns void
language sql security definer set search_path = ''
as $$
  update public.groups g
  set progress = least(100, round(100.0 * (select count(*) from public.weekly_reports r
                                           where r.group_id = g.id and r.week <= g.report_count)
                                  / g.report_count))
  where g.id = gid
$$;

create or replace function app_private.on_report_progress() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform app_private.refresh_progress(coalesce(new.group_id, old.group_id));
  return null;
end $$;
create trigger report_progress after insert or delete on public.weekly_reports
  for each row execute function app_private.on_report_progress();

-- The supervisor (or the PBL office) sets how many weekly reports are due.
create or replace function public.set_report_count(p_group uuid, p_count int) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not (app_private.mentors_group(p_group) or app_private.is_admin()) then
    raise exception 'Only this group''s supervisor can change the number of reports.';
  end if;
  if p_count not between 1 and 10 then raise exception 'Choose between 1 and 10 reports.'; end if;
  update public.groups set report_count = p_count where id = p_group;
  perform app_private.refresh_progress(p_group);
end $$;

revoke execute on function app_private.refresh_progress, app_private.on_report_progress from public, anon, authenticated;
revoke execute on function public.set_report_count from public, anon;
grant execute on function public.set_report_count to authenticated;
