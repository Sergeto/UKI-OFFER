-- Mută funcțiile ajutătoare din schema publică (expusă prin API) într-o schemă privată.
-- Politicile RLS rămân valabile: Postgres le leagă de funcție, nu de nume.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter function public.is_org_member(uuid) set schema private;
alter function public.is_org_admin(uuid) set schema private;
alter function public.add_creator_as_owner() set schema private;
alter function public.touch_updated_at() set schema private;
