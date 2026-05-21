-- Gargi Surgical & Healthcare
-- Supabase/Postgres schema for medical ecommerce.
-- Copy-paste this full file into the Supabase SQL editor.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.order_status as enum ('pending', 'confirmed', 'delivered', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  subcategory_id uuid references public.subcategories(id) on delete set null,
  name text not null,
  slug text not null unique,
  category text not null,
  price numeric(14, 2) not null check (price >= 0),
  discount numeric(6, 2) not null default 0 check (discount >= 0 and discount <= 100),
  stock integer not null default 0 check (stock >= 0),
  description text not null default '',
  brand text not null default '',
  features text[] not null default '{}',
  is_featured boolean not null default false,
  show_on_homepage boolean not null default false,
  is_special_offer boolean not null default false,
  is_rental boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  slug text not null unique,
  category text not null default 'Mobility',
  price_per_day numeric(14, 2) not null check (price_per_day >= 0),
  price_per_week numeric(14, 2),
  price_per_month numeric(14, 2),
  availability boolean not null default true,
  description text not null default '',
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  address text not null,
  total_price numeric(14, 2) not null default 0 check (total_price >= 0),
  status public.order_status not null default 'pending',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  image_url text,
  is_published boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.google_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_name text not null,
  area text not null default 'Mumbai',
  rating numeric(2, 1) not null default 5 check (rating >= 1 and rating <= 5),
  review text not null,
  source text not null default 'Google',
  is_featured boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe upgrades for databases that were created with an older version of this file.
-- `create table if not exists` does not add new columns to existing tables.
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.products
  add column if not exists show_on_homepage boolean not null default false,
  add column if not exists is_special_offer boolean not null default false,
  add column if not exists subcategory_id uuid references public.subcategories(id) on delete set null;

alter table public.product_images
  add column if not exists media_type text not null default 'image';

alter table public.rentals
  add column if not exists category text not null default 'Mobility',
  add column if not exists price_per_week numeric(14, 2),
  add column if not exists price_per_month numeric(14, 2);

alter table public.products
  alter column price type numeric(14, 2),
  alter column discount type numeric(6, 2);

alter table public.rentals
  alter column price_per_day type numeric(14, 2);

alter table public.orders
  alter column total_price type numeric(14, 2);

alter table public.order_items
  alter column unit_price type numeric(14, 2);

alter table public.google_reviews
  add column if not exists reviewer_name text not null default '',
  add column if not exists area text not null default 'Mumbai',
  add column if not exists rating numeric(2, 1) not null default 5 check (rating >= 1 and rating <= 5),
  add column if not exists review text not null default '',
  add column if not exists source text not null default 'Google',
  add column if not exists is_featured boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_subcategories_category_id on public.subcategories(category_id);
create index if not exists idx_products_subcategory_id on public.products(subcategory_id);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_products_homepage on public.products(show_on_homepage);
create index if not exists idx_products_special_offer on public.products(is_special_offer);
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_rentals_product_id on public.rentals(product_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_blogs_slug on public.blogs(slug);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_google_reviews_featured on public.google_reviews(is_featured);

insert into public.categories (name, slug, description, image_url, sort_order, is_active)
values
  ('Mobility', 'mobility', 'Wheelchairs, walkers and daily movement support for safer home recovery.', '/media/mobility.png', 0, true),
  ('Personal Hygiene', 'personal-hygiene', 'Reliable hygiene essentials for adults, babies and everyday care routines.', '/media/Personal-hygiene.png', 1, true),
  ('Surgical', 'surgical', 'Sterile surgical consumables, gloves and dressing support for clinics and homes.', '/media/Surgical.png', 2, true),
  ('Orthopedic', 'orthopedic', 'Knee, back and joint support products for recovery and everyday comfort.', '/media/orthopedic.png', 3, true),
  ('Digital Monitoring', 'digital-monitoring', 'BP monitors, oximeters and home devices for daily health checks.', '/media/digital-monitoring.png', 4, true)
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      image_url = excluded.image_url,
      sort_order = excluded.sort_order,
      is_active = true,
      updated_at = now();

with seed_subcategories(category_slug, name, slug, sort_order) as (
  values
    ('mobility', 'Wheelchairs', 'wheelchairs', 0),
    ('mobility', 'Walkers', 'walkers', 1),
    ('personal-hygiene', 'Adult Diapers', 'adult-diapers', 0),
    ('personal-hygiene', 'Baby Diapers', 'baby-diapers', 1),
    ('surgical', 'Gloves', 'gloves', 0),
    ('surgical', 'Dressing Products', 'dressing', 1),
    ('orthopedic', 'Knee Support', 'knee-support', 0),
    ('orthopedic', 'Back Support', 'back-support', 1),
    ('digital-monitoring', 'Blood Pressure Monitor', 'bp-monitor', 0),
    ('digital-monitoring', 'Oximeter', 'oximeter', 1),
    ('digital-monitoring', 'Thermometer', 'thermometer', 2)
)
insert into public.subcategories (category_id, name, slug, description, sort_order, is_active)
select categories.id, seed_subcategories.name, seed_subcategories.slug, '', seed_subcategories.sort_order, true
from seed_subcategories
join public.categories on categories.slug = seed_subcategories.category_slug
on conflict (category_id, slug) do update
  set name = excluded.name,
      sort_order = excluded.sort_order,
      is_active = true,
      updated_at = now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_subcategories_updated_at on public.subcategories;
create trigger set_subcategories_updated_at
before update on public.subcategories
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_rentals_updated_at on public.rentals;
create trigger set_rentals_updated_at
before update on public.rentals
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_blogs_updated_at on public.blogs;
create trigger set_blogs_updated_at
before update on public.blogs
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_google_reviews_updated_at on public.google_reviews;
create trigger set_google_reviews_updated_at
before update on public.google_reviews
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update
    set name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'sureshptl2006@gmail.com',
    'gargihealthcaresales@gmail.com',
    'rjdhav67@gmail.com'
  );
$$;

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.rentals enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.blogs enable row level security;
alter table public.profiles enable row level security;
alter table public.google_reviews enable row level security;

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories for select
using (is_active = true);

drop policy if exists "Public can read active subcategories" on public.subcategories;
create policy "Public can read active subcategories"
on public.subcategories for select
using (is_active = true);

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
using (is_active = true);

drop policy if exists "Public can read product images" on public.product_images;
create policy "Public can read product images"
on public.product_images for select
using (true);

drop policy if exists "Public can read active rentals" on public.rentals;
create policy "Public can read active rentals"
on public.rentals for select
using (is_active = true);

drop policy if exists "Public can read published blogs" on public.blogs;
create policy "Public can read published blogs"
on public.blogs for select
using (is_published = true);

drop policy if exists "Public can read featured google reviews" on public.google_reviews;
create policy "Public can read featured google reviews"
on public.google_reviews for select
using (is_featured = true);

drop policy if exists "Authenticated users can manage categories" on public.categories;
create policy "Authenticated users can manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage subcategories" on public.subcategories;
create policy "Authenticated users can manage subcategories"
on public.subcategories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage products" on public.products;
create policy "Authenticated users can manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage product images" on public.product_images;
create policy "Authenticated users can manage product images"
on public.product_images for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage rentals" on public.rentals;
create policy "Authenticated users can manage rentals"
on public.rentals for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage orders" on public.orders;
create policy "Authenticated users can manage orders"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage order items" on public.order_items;
create policy "Authenticated users can manage order items"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage blogs" on public.blogs;
create policy "Authenticated users can manage blogs"
on public.blogs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can manage google reviews" on public.google_reviews;
create policy "Authenticated users can manage google reviews"
on public.google_reviews for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
on public.orders for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders"
on public.orders for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can read own order items" on public.order_items;
create policy "Users can read own order items"
on public.order_items for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "Users can create own order items" on public.order_items;
create policy "Users can create own order items"
on public.order_items for insert
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "Development dashboard can manage products" on public.products;
drop policy if exists "Development dashboard can manage product images" on public.product_images;
drop policy if exists "Development dashboard can manage rentals" on public.rentals;
drop policy if exists "Development dashboard can manage orders" on public.orders;
drop policy if exists "Development dashboard can manage order items" on public.order_items;
drop policy if exists "Development dashboard can manage blogs" on public.blogs;
drop policy if exists "Development dashboard can manage google reviews" on public.google_reviews;
