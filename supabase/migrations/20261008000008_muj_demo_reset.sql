-- Replace the made-up demo data with MUJ accounts.
--
-- Every account now uses a university address: students @muj.manipal.edu,
-- teachers and the PBL office @jaipur.manipal.edu. The one demo login is
-- Mihir Sanghvi (password pbl@2026), not yet in a group, so the whole
-- start-of-semester flow can be walked through. Krishna Agarwal is on the
-- student roster without a login; Mihir can invite him, and the invitation
-- is waiting when Krishna signs up.

-- --------------------------------------------------------- old demo data

delete from public.announcements;
delete from public.groups;                -- members, requests, reports, queries, changes
delete from public.student_grades;
delete from public.notifications;
delete from auth.users where email not ilike '%@muj.manipal.edu' and email not ilike '%@jaipur.manipal.edu';
delete from public.students;
delete from legacy.projects;              -- the retired model's demo rows
delete from public.faculty where source = 'demo';

-- ------------------------------------------------------- domain is mandatory

alter table public.profiles add constraint profiles_university_email
  check (email ~* '@(muj|jaipur)\.manipal\.edu$');
alter table public.students add constraint students_muj_email
  check (university_email ~* '@muj\.manipal\.edu$');

-- ------------------------------------------------------------------ roster

insert into public.students (id, full_name, registration_number, university_email, programme, branch, semester, section, batch)
values ('s-2427010030', 'Krishna Agarwal', '2427010030', 'krishna.2427010030@muj.manipal.edu',
        'B.Tech', 'Computer Science & Engineering', 5, '', '2024 – 2028');

-- -------------------------------------------------------- the demo student
-- The sign-up trigger creates his student record and profile from this row.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', 'b2000000-0000-4000-8000-002427010544', 'authenticated',
  'authenticated', 'mihir.2427010544@muj.manipal.edu',
  extensions.crypt('pbl@2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Mihir Sanghvi","programme":"B.Tech","branch":"Computer Science & Engineering","semester":"5"}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'b2000000-0000-4000-8000-002427010544', 'b2000000-0000-4000-8000-002427010544',
  jsonb_build_object('sub', 'b2000000-0000-4000-8000-002427010544',
                     'email', 'mihir.2427010544@muj.manipal.edu', 'email_verified', true),
  'email', now(), now(), now());

update public.students set personal_email = 'sanghvimihir04@gmail.com' where id = 's-2427010544';
