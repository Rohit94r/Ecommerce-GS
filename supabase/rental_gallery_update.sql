-- Gargi Surgical rental multiple-photo update.
-- Run this in Supabase SQL Editor, then redeploy/refresh the site.

create extension if not exists "pgcrypto";

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'sureshptl2006@gmail.com',
    'gargihealthcaresales@gmail.com',
    'gargisurgical58@gmail.com',
    'rjdhav67@gmail.com'
  );
$$;

alter table public.rentals
  add column if not exists image_url text,
  add column if not exists is_active boolean not null default true,
  add column if not exists category text not null default 'Mobility',
  add column if not exists price_per_week numeric(14, 2),
  add column if not exists price_per_month numeric(14, 2),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.rental_images (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_rental_images_rental_id
  on public.rental_images(rental_id);

create index if not exists idx_rental_images_sort
  on public.rental_images(rental_id, sort_order);

alter table public.rentals enable row level security;
alter table public.rental_images enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.rentals to anon, authenticated;
grant select on public.rental_images to anon, authenticated;
grant insert, update, delete on public.rental_images to authenticated;
grant insert, update, delete on public.rentals to authenticated;

drop policy if exists "Public can read active rentals" on public.rentals;
create policy "Public can read active rentals"
on public.rentals for select
using (is_active = true);

drop policy if exists "Authenticated users can manage rentals" on public.rentals;
create policy "Authenticated users can manage rentals"
on public.rentals for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read rental images" on public.rental_images;
create policy "Public can read rental images"
on public.rental_images for select
using (
  exists (
    select 1
    from public.rentals
    where rentals.id = rental_images.rental_id
      and rentals.is_active = true
  )
);

drop policy if exists "Authenticated users can manage rental images" on public.rental_images;
create policy "Authenticated users can manage rental images"
on public.rental_images for all
using (public.is_admin())
with check (public.is_admin());

-- Backfill each rental's old single image into the new gallery table.
insert into public.rental_images (rental_id, image_url, alt_text, sort_order)
select rentals.id, rentals.image_url, rentals.name, 0
from public.rentals
where rentals.image_url is not null
  and rentals.image_url <> ''
  and not exists (
    select 1
    from public.rental_images
    where rental_images.rental_id = rentals.id
  );

