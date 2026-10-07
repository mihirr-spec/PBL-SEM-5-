-- Keep the RLS helper functions out of the exposed API schema, so they can
-- back policies without being callable as /rest/v1/rpc endpoints.
-- Policies reference functions by identity, so they follow the move.

create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;

alter function public.current_app_role() set schema app_private;
alter function public.is_staff() set schema app_private;
alter function public.my_student_id() set schema app_private;
alter function public.my_project_id() set schema app_private;
