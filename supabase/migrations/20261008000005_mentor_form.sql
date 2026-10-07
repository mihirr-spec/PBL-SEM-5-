-- Mentor registration with a signed PBL form.
--
-- The student and teacher have already agreed; the request makes it
-- official. The team lead uploads the signed form, the teacher reviews it
-- and approves, rejects, or asks for changes. Changes send the request back
-- to the team lead, who uploads a corrected form and resubmits it.

alter table public.mentor_requests
  add column form_path text,
  add column form_name text,
  add column review_note text not null default '',
  add column resubmitted_at timestamptz;

alter table public.mentor_requests drop constraint mentor_requests_status_check;
alter table public.mentor_requests add constraint mentor_requests_status_check
  check (status in ('pending', 'changes_requested', 'approved', 'rejected', 'closed'));

-- Open = waiting on the teacher or on the group.
create or replace function app_private.is_open_request(s text) returns boolean
language sql immutable set search_path = ''
as $$ select s in ('pending', 'changes_requested') $$;

-- ----------------------------------------------------------- notifications

create or replace function app_private.on_request() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare g public.groups; f public.faculty;
begin
  select * into g from public.groups where id = new.group_id;
  select * into f from public.faculty where id = new.faculty_id;
  if tg_op = 'INSERT' then
    perform app_private.notify(array[f.user_id], 'request',
      'Group ' || g.number || ' sent their signed PBL form', g.project_title, '/faculty/requests');
  elsif new.status = 'pending' and old.status = 'changes_requested' then
    perform app_private.notify(array[f.user_id], 'request',
      'Group ' || g.number || ' resubmitted their PBL form', g.project_title, '/faculty/requests');
  elsif new.status is distinct from old.status and old.status = 'pending'
        and new.status in ('approved', 'rejected', 'changes_requested') then
    perform app_private.notify(app_private.group_user_ids(g.id), 'request',
      f.full_name || case new.status
        when 'approved' then ' approved your mentor registration'
        when 'rejected' then ' rejected your mentor registration'
        else ' asked for changes to your PBL form' end,
      coalesce(nullif(new.review_note, ''), g.project_title), '/student/group');
  end if;
  return new;
end $$;

-- ----------------------------------------------------------------- actions

create or replace function app_private.check_form(gid uuid, p_form_path text, p_form_name text)
returns void
language plpgsql stable set search_path = ''
as $$
begin
  if coalesce(p_form_path, '') = '' or coalesce(p_form_name, '') = '' then
    raise exception 'Upload the signed PBL form first.';
  end if;
  if split_part(p_form_path, '/', 1) <> gid::text then
    raise exception 'The form must be uploaded to your group''s folder.';
  end if;
end $$;

create or replace function app_private.require_leader() returns uuid
language plpgsql stable security definer set search_path = ''
as $$
declare gid uuid := app_private.my_group_id();
begin
  if gid is null then raise exception 'Form or join a group first.'; end if;
  if (select leader_student_id from public.groups where id = gid) is distinct from app_private.my_student_id() then
    raise exception 'Only the team lead can send the mentor request.';
  end if;
  return gid;
end $$;

create or replace function public.request_mentor(
  p_faculty_id text, p_message text, p_form_path text, p_form_name text
) returns void
language plpgsql security definer set search_path = ''
as $$
declare gid uuid := app_private.require_leader();
begin
  if (select mentor_id from public.groups where id = gid) is not null then
    raise exception 'Your group already has a mentor.';
  end if;
  perform app_private.check_form(gid, p_form_path, p_form_name);
  if exists (select 1 from public.mentor_requests
             where group_id = gid and faculty_id = p_faculty_id and app_private.is_open_request(status)) then
    raise exception 'You already have an open request with this teacher.';
  end if;
  if (select count(*) from public.mentor_requests
      where group_id = gid and app_private.is_open_request(status)) >= 3 then
    raise exception 'You can have at most 3 open requests at a time.';
  end if;
  insert into public.mentor_requests (group_id, faculty_id, message, form_path, form_name)
  values (gid, p_faculty_id, coalesce(p_message, ''), p_form_path, p_form_name);
end $$;

-- The team lead sends a corrected form after the teacher asked for changes.
create or replace function public.resubmit_mentor_request(
  p_request uuid, p_message text, p_form_path text, p_form_name text
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  gid uuid := app_private.require_leader();
  r public.mentor_requests;
begin
  select * into r from public.mentor_requests where id = p_request for update;
  if r.id is null or r.group_id <> gid then raise exception 'Request not found.'; end if;
  if r.status <> 'changes_requested' then
    raise exception 'This request is not waiting for changes.';
  end if;
  if (select mentor_id from public.groups where id = gid) is not null then
    raise exception 'Your group already has a mentor.';
  end if;
  perform app_private.check_form(gid, p_form_path, p_form_name);
  update public.mentor_requests
  set status = 'pending', form_path = p_form_path, form_name = p_form_name,
      message = coalesce(nullif(trim(p_message), ''), message),
      resubmitted_at = now(), decided_at = null
  where id = r.id;
end $$;

-- p_decision: 'approve', 'reject' or 'changes'.
-- Returns 'approved', 'rejected', 'changes_requested', 'already_assigned' or 'full'.
create or replace function public.review_mentor_request(p_request uuid, p_decision text, p_note text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  me text := app_private.my_faculty_id();
  r public.mentor_requests;
  g public.groups;
  note text := coalesce(trim(p_note), '');
begin
  select * into r from public.mentor_requests where id = p_request for update;
  if r.id is null or r.faculty_id is distinct from me then raise exception 'Request not found.'; end if;
  if r.status <> 'pending' then return r.status; end if;

  if p_decision = 'reject' then
    update public.mentor_requests set status = 'rejected', review_note = note, decided_at = now() where id = r.id;
    return 'rejected';
  elsif p_decision = 'changes' then
    if note = '' then raise exception 'Say what needs to change so the group can fix it.'; end if;
    update public.mentor_requests set status = 'changes_requested', review_note = note, decided_at = now() where id = r.id;
    return 'changes_requested';
  elsif p_decision <> 'approve' then
    raise exception 'Unknown decision.';
  end if;

  -- Lock the group so two teachers approving at once cannot both win.
  select * into g from public.groups where id = r.group_id for update;
  if g.mentor_id is not null then
    update public.mentor_requests set status = 'closed', decided_at = now() where id = r.id;
    return 'already_assigned';
  end if;
  if (select count(*) from public.groups where mentor_id = me)
     >= (select max_groups from public.faculty where id = me) then
    return 'full';
  end if;

  update public.groups set mentor_id = me, assigned_at = now() where id = g.id;
  update public.mentor_requests set status = 'approved', review_note = note, decided_at = now() where id = r.id;
  update public.mentor_requests set status = 'closed', decided_at = now()
    where group_id = g.id and app_private.is_open_request(status) and id <> r.id;
  return 'approved';
end $$;

-- Allotment also closes requests that were waiting on changes.
create or replace function public.auto_allocate_mentors() returns int
language plpgsql security definer set search_path = ''
as $$
declare
  g record;
  pick text;
  assigned int := 0;
begin
  if not app_private.is_admin() then raise exception 'Administrators only.'; end if;
  for g in select id from public.groups where mentor_id is null order by created_at for update loop
    select f.id into pick from public.faculty f
    where f.user_id is not null
      and (select count(*) from public.groups x where x.mentor_id = f.id) < f.max_groups
    order by random() limit 1;
    exit when pick is null;
    update public.groups set mentor_id = pick, assigned_at = now() where id = g.id;
    update public.mentor_requests set status = 'closed', decided_at = now()
      where group_id = g.id and app_private.is_open_request(status);
    perform app_private.notify(app_private.group_user_ids(g.id), 'group',
      'A mentor has been assigned to your group',
      (select full_name from public.faculty where id = pick), '/student/group');
    assigned := assigned + 1;
  end loop;
  return assigned;
end $$;

-- The old request/decide signatures no longer apply.
revoke execute on function public.request_mentor(text, text) from authenticated;
revoke execute on function public.decide_mentor_request(uuid, boolean) from authenticated;

revoke execute on function app_private.check_form, app_private.require_leader,
  app_private.is_open_request from public, anon;
grant execute on function app_private.check_form, app_private.require_leader,
  app_private.is_open_request to authenticated;

revoke execute on function public.request_mentor(text, text, text, text),
  public.resubmit_mentor_request, public.review_mentor_request from public, anon;
grant execute on function public.request_mentor(text, text, text, text),
  public.resubmit_mentor_request, public.review_mentor_request to authenticated;

-- Forms live in submissions/<group id>/mentor-form/<file>; the existing
-- submissions policies already let the group upload and staff read them.

-- ------------------------------------------------- three more teacher logins

with accounts (id, email) as (
  values
    ('a1000000-0000-4000-8000-000000004001'::uuid, 'n.joshi@university.edu.in'),
    ('a1000000-0000-4000-8000-000000005001'::uuid, 'v.rathore@university.edu.in'),
    ('a1000000-0000-4000-8000-000000006001'::uuid, 'k.menon@university.edu.in')
)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
select '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
  extensions.crypt('pbl@2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
from accounts;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.id in ('a1000000-0000-4000-8000-000000004001', 'a1000000-0000-4000-8000-000000005001',
               'a1000000-0000-4000-8000-000000006001');

insert into public.profiles (id, email, role, display_name, profile_id) values
  ('a1000000-0000-4000-8000-000000004001', 'n.joshi@university.edu.in', 'faculty', 'Dr. Neha Joshi', 'f-303'),
  ('a1000000-0000-4000-8000-000000005001', 'v.rathore@university.edu.in', 'faculty', 'Dr. Vikram Rathore', 'f-304'),
  ('a1000000-0000-4000-8000-000000006001', 'k.menon@university.edu.in', 'faculty', 'Dr. Kavita Menon', 'f-305');

insert into public.faculty (id, user_id, full_name, faculty_code, department, designation, email, expertise, office_location) values
  ('f-303', 'a1000000-0000-4000-8000-000000004001', 'Dr. Neha Joshi', 'FAC-CSE-0188',
   'Computer Science & Engineering', 'Assistant Professor', 'n.joshi@university.edu.in',
   'Machine Learning, Computer Vision, Natural Language Processing', 'Block C, Cabin 220'),
  ('f-304', 'a1000000-0000-4000-8000-000000005001', 'Dr. Vikram Rathore', 'FAC-CSE-0121',
   'Computer Science & Engineering', 'Associate Professor', 'v.rathore@university.edu.in',
   'Internet of Things, Embedded Systems, Wireless Sensor Networks', 'Block C, Cabin 208'),
  ('f-305', 'a1000000-0000-4000-8000-000000006001', 'Dr. Kavita Menon', 'FAC-CSE-0164',
   'Computer Science & Engineering', 'Assistant Professor', 'k.menon@university.edu.in',
   'Web Technologies, Cloud Computing, Software Engineering', 'Block C, Cabin 226');
