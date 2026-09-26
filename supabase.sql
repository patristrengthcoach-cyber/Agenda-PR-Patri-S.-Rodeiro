-- Agenda Patri S. Rodeiro · Strength & Rehab
-- Pega todo esto en Supabase → SQL Editor → New query → Run

create table if not exists public.clientes (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.sesiones (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.ajustes (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seguridad: solo usuarias con sesión iniciada (tú y tu secretaria) pueden leer y escribir.
alter table public.clientes enable row level security;
alter table public.sesiones enable row level security;
alter table public.ajustes  enable row level security;

drop policy if exists "equipo" on public.clientes;
drop policy if exists "equipo" on public.sesiones;
drop policy if exists "equipo" on public.ajustes;
create policy "equipo" on public.clientes for all to authenticated using (true) with check (true);
create policy "equipo" on public.sesiones for all to authenticated using (true) with check (true);
create policy "equipo" on public.ajustes  for all to authenticated using (true) with check (true);

-- Fecha de última modificación automática
create or replace function public.tocar_fecha() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists t_clientes on public.clientes;
drop trigger if exists t_sesiones on public.sesiones;
drop trigger if exists t_ajustes on public.ajustes;
create trigger t_clientes before update on public.clientes for each row execute function public.tocar_fecha();
create trigger t_sesiones before update on public.sesiones for each row execute function public.tocar_fecha();
create trigger t_ajustes  before update on public.ajustes  for each row execute function public.tocar_fecha();

-- Cambios en directo entre dispositivos
alter publication supabase_realtime add table public.clientes, public.sesiones, public.ajustes;
