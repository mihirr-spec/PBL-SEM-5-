-- Self sign-up with MUJ emails, and team invitations.
--
-- Sign-up: anyone with a university address can create an account; Supabase
-- Auth emails a confirmation link before the first sign-in. A trigger on
-- auth.users decides what the account is from the address alone:
--   @jaipur.manipal.edu  → the PBL office if listed in app_private.admin_emails,
--                          otherwise the matching teacher in the faculty table
--   @muj.manipal.edu     → a student, linked to their roster row (matched by
--                          email, or by the registration number in the email)
--                          or created from the details given at sign-up
-- Any other address is refused.
--
-- Invitations: the team lead no longer adds classmates directly. Each one is
-- invited and joins only after accepting from their Requests page.

-- ------------------------------------------------------------ administrators

create table app_private.admin_emails (email text primary key check (email = lower(email)));
insert into app_private.admin_emails (email) values ('babita.kinha@jaipur.manipal.edu');

-- ------------------------------------------------------------------ sign-up

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
  -- Staff -----------------------------------------------------------------
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

  -- Students --------------------------------------------------------------
  if em not like '%@muj.manipal.edu' then
    raise exception 'Use your university email: name.registrationno@muj.manipal.edu.';
  end if;

  -- MUJ student addresses end in the registration number: mihir.2427010544@…
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

    -- 24xxxxxxxx = admitted in 2024. Odd semesters start in July.
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

  -- Invitations sent before this student had an account.
  perform app_private.notify(array[new.id], 'group',
    l.full_name || ' has invited you to join ' || g.name, g.project_title, '/student/requests')
  from public.group_invitations i
  join public.groups g on g.id = i.group_id
  join public.students l on l.id = i.invited_by
  where i.student_id = s.id and i.status = 'pending';

  return new;
end $$;

-- ------------------------------------------------------------- invitations

create table public.group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  student_id text not null references public.students (id) on delete cascade,
  invited_by text not null references public.students (id) on delete cascade,
  -- cancelled = withdrawn by the lead, or void because the student joined
  -- another group
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create unique index group_invitations_one_pending
  on public.group_invitations (group_id, student_id) where status = 'pending';
create index on public.group_invitations (student_id, status);

alter table public.group_invitations enable row level security;
revoke all on public.group_invitations from anon;
revoke insert, update, delete on public.group_invitations from authenticated;

create policy "invited student, the group, or staff" on public.group_invitations
  for select to authenticated
  using (
    student_id = (select app_private.my_student_id())
    or group_id = (select app_private.my_group_id())
    or (select app_private.is_staff())
  );

-- The trigger above refers to group_invitations, so it is created after it.
create trigger on_auth_user_created after insert on auth.users
  for each row execute function app_private.on_auth_user_created();

-- Invites one classmate by registration number. Callers check who may invite.
create or replace function app_private.invite_student(gid uuid, p_reg text) returns void
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
  if s.id = g.leader_student_id then raise exception 'You are already in this group.'; end if;
  if exists (select 1 from public.group_members where student_id = s.id) then
    raise exception '% (%) is already in a group.', s.full_name, reg;
  end if;
  if exists (select 1 from public.group_invitations
             where group_id = gid and student_id = s.id and status = 'pending') then
    raise exception '% has already been invited.', s.full_name;
  end if;
  if (select count(*) from public.group_members where group_id = gid)
     + (select count(*) from public.group_invitations where group_id = gid and status = 'pending') >= 5 then
    raise exception 'A group can have at most 5 students, counting pending invitations.';
  end if;

  insert into public.group_invitations (group_id, student_id, invited_by)
  values (gid, s.id, g.leader_student_id);

  leader_name := (select full_name from public.students where id = g.leader_student_id);
  perform app_private.notify(array[s.user_id], 'group',
    leader_name || ' has invited you to join ' || g.name, g.project_title, '/student/requests');
end $$;

-- Creating a group now invites the classmates instead of adding them.
create or replace function public.create_group(
  p_name text, p_project_title text, p_project_idea text, p_domain text, p_member_regs text[]
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  me text := app_private.my_student_id();
  gid uuid;
  reg text;
begin
  if me is null then raise exception 'Only students can create groups.'; end if;
  if exists (select 1 from public.group_members where student_id = me) then
    raise exception 'You are already in a group.';
  end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_project_title), '') = '' then
    raise exception 'Give the group a name and a project title.';
  end if;
  if coalesce(array_length(p_member_regs, 1), 0) > 4 then
    raise exception 'A group can have at most 5 students including you.';
  end if;

  insert into public.groups (name, project_title, project_idea, domain, leader_student_id)
  values (trim(p_name), trim(p_project_title), coalesce(p_project_idea, ''), coalesce(p_domain, ''), me)
  returning id into gid;
  insert into public.group_members (group_id, student_id, team_role) values (gid, me, 'Team Lead');

  -- Starting your own group answers any invitations you had.
  update public.group_invitations set status = 'cancelled', decided_at = now()
  where student_id = me and status = 'pending';

  foreach reg in array coalesce(p_member_regs, '{}') loop
    if trim(reg) = '' then continue; end if;
    perform app_private.invite_student(gid, reg);
  end loop;
  return gid;
end $$;

-- Team lead: invite one more classmate after the group exists.
create or replace function public.invite_member(p_reg text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform app_private.invite_student(app_private.require_leader(), p_reg);
end $$;

-- Team lead: withdraw a pending invitation.
create or replace function public.cancel_invitation(p_invitation uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare gid uuid := app_private.require_leader();
begin
  update public.group_invitations set status = 'cancelled', decided_at = now()
  where id = p_invitation and group_id = gid and status = 'pending';
  if not found then raise exception 'That invitation is no longer pending.'; end if;
end $$;

-- The invited student accepts or declines. Returns 'accepted' or 'declined'.
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
  if (select count(*) from public.group_members where group_id = g.id) >= 5 then
    raise exception 'This group is already full.';
  end if;

  insert into public.group_members (group_id, student_id) values (g.id, me);
  update public.group_invitations set status = 'accepted', decided_at = now() where id = i.id;
  -- One group per student: the rest of their invitations no longer apply.
  update public.group_invitations set status = 'cancelled', decided_at = now()
  where student_id = me and status = 'pending';

  perform app_private.notify(
    array(select s.user_id from public.group_members gm join public.students s on s.id = gm.student_id
          where gm.group_id = g.id and gm.student_id <> me),
    'group', my_name || ' joined ' || g.name, g.project_title, '/student/group');
  return 'accepted';
end $$;

-- Invitations waiting for the caller, with what they need to decide: the
-- group, who leads it, who is in it, and where its supervisor request stands.
create or replace function public.my_invitations() returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', i.id,
    'createdAt', i.created_at,
    'group', jsonb_build_object(
      'id', g.id, 'number', g.number, 'name', g.name, 'projectTitle', g.project_title,
      'projectIdea', g.project_idea, 'domain', g.domain),
    'leader', jsonb_build_object(
      'fullName', l.full_name, 'registrationNumber', l.registration_number, 'email', l.university_email),
    'members', (select coalesce(jsonb_agg(jsonb_build_object(
        'fullName', s.full_name, 'registrationNumber', s.registration_number) order by s.full_name), '[]')
      from public.group_members gm join public.students s on s.id = gm.student_id
      where gm.group_id = g.id),
    'mentor', (select jsonb_build_object('fullName', f.full_name, 'designation', f.designation,
        'department', f.department, 'email', f.email)
      from public.faculty f where f.id = g.mentor_id),
    'requestedTeachers', (select coalesce(jsonb_agg(f.full_name), '[]')
      from public.mentor_requests r join public.faculty f on f.id = r.faculty_id
      where r.group_id = g.id and app_private.is_open_request(r.status))
  ) order by i.created_at desc), '[]')
  from public.group_invitations i
  join public.groups g on g.id = i.group_id
  join public.students l on l.id = i.invited_by
  where i.student_id = app_private.my_student_id() and i.status = 'pending'
$$;

-- The caller's group's invitations, with the invited students' names (group
-- members cannot read other students' records directly).
create or replace function public.group_invitations() returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', i.id, 'status', i.status, 'createdAt', i.created_at, 'decidedAt', i.decided_at,
    'fullName', s.full_name, 'registrationNumber', s.registration_number,
    'hasAccount', s.user_id is not null
  ) order by i.created_at desc), '[]')
  from public.group_invitations i join public.students s on s.id = i.student_id
  where i.group_id = app_private.my_group_id() and i.status in ('pending', 'declined')
$$;

revoke execute on function app_private.on_auth_user_created, app_private.invite_student from public, anon, authenticated;
revoke execute on function public.create_group, public.invite_member, public.cancel_invitation,
  public.respond_to_invitation, public.my_invitations, public.group_invitations from public, anon;
grant execute on function public.create_group, public.invite_member, public.cancel_invitation,
  public.respond_to_invitation, public.my_invitations, public.group_invitations to authenticated;
