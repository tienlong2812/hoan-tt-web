-- ==========================================
-- HOAN TT WEB: Supabase SQL Schema
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE (Extended over auth.users)
-- ==========================================
create table public.users (
  user_id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  full_name text,
  email text unique not null,
  phone_number text,
  role text default 'customer' check (role in ('admin', 'customer')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==========================================
-- 2. ADDRESSES TABLE
-- ==========================================
create table public.addresses (
  address_id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(user_id) on delete cascade not null,
  receiver_name text not null,
  receiver_phone text not null,
  province text not null,
  district text not null,
  ward text not null,
  detail_address text not null,
  is_default boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==========================================
-- 3. CATEGORIES TABLE
-- ==========================================
create table public.categories (
  category_id uuid default uuid_generate_v4() primary key,
  category_name text not null,
  slug text unique not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==========================================
-- 4. BRANDS TABLE
-- ==========================================
create table public.brands (
  brand_id uuid default uuid_generate_v4() primary key,
  brand_name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==========================================
-- 5. PRODUCTS TABLE
-- ==========================================
create table public.products (
  product_id uuid default uuid_generate_v4() primary key,
  product_name text not null,
  slug text unique not null,
  description text,
  price numeric(10, 2) not null,
  discount_price numeric(10, 2),
  stock integer default 0 not null,
  category_id uuid references public.categories(category_id) on delete set null,
  brand_id uuid references public.brands(brand_id) on delete set null,
  thumbnail_url text,
  status text default 'active' check (status in ('active', 'draft', 'archived')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==========================================
-- 6. PRODUCT_GALLERY TABLE
-- ==========================================
create table public.product_gallery (
  image_id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(product_id) on delete cascade not null,
  image_url text not null,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 7. ORDERS TABLE
-- ==========================================
create table public.orders (
  order_id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(user_id) on delete set null,
  order_date timestamp with time zone default now(),
  total_amount numeric(10, 2) not null,
  shipping_fee numeric(10, 2) default 0 not null,
  payment_method text not null check (payment_method in ('COD', 'BANK_TRANSFER', 'CARD')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  order_status text default 'pending' check (order_status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb not null, -- Store snapshot of address at time of order
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==========================================
-- 8. ORDER_ITEMS TABLE
-- ==========================================
create table public.order_items (
  order_item_id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(order_id) on delete cascade not null,
  product_id uuid references public.products(product_id) on delete set null,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 9. REVIEWS TABLE
-- ==========================================
create table public.reviews (
  review_id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(user_id) on delete cascade not null,
  product_id uuid references public.products(product_id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  review_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(user_id, product_id) -- A user can only review a product once
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_gallery enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- USERS
create policy "Users can view own profile" 
on public.users for select using (auth.uid() = user_id);
create policy "Users can update own profile" 
on public.users for update using (auth.uid() = user_id);

-- ADDRESSES
create policy "Users can view own addresses" 
on public.addresses for select using (auth.uid() = user_id);
create policy "Users can insert own addresses" 
on public.addresses for insert with check (auth.uid() = user_id);
create policy "Users can update own addresses" 
on public.addresses for update using (auth.uid() = user_id);
create policy "Users can delete own addresses" 
on public.addresses for delete using (auth.uid() = user_id);

-- PRODUCTS, CATEGORIES, BRANDS (Public view)
create policy "Public can view categories" 
on public.categories for select using (true);
create policy "Public can view brands" 
on public.brands for select using (true);
create policy "Public can view active products" 
on public.products for select using (status = 'active');
create policy "Public can view product gallery" 
on public.product_gallery for select using (true);

-- ORDERS & ORDER ITEMS
create policy "Users can view own orders" 
on public.orders for select using (auth.uid() = user_id);
create policy "Users can create own orders" 
on public.orders for insert with check (auth.uid() = user_id);
create policy "Users can view own order items" 
on public.order_items for select using (
  order_id in (select order_id from public.orders where user_id = auth.uid())
);
create policy "Users can insert own order items" 
on public.order_items for insert with check (
  order_id in (select order_id from public.orders where user_id = auth.uid())
);

-- REVIEWS
create policy "Public can view reviews" 
on public.reviews for select using (true);
create policy "Users can insert own reviews" 
on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" 
on public.reviews for update using (auth.uid() = user_id);


-- ADMIN POLICIES (Assuming 'admin' role in public.users)
-- (In a real scenario, you can check role directly, here we use an auth function or subquery)
create or replace function auth.is_admin() returns boolean as $$
  select exists(select 1 from public.users where user_id = auth.uid() and role = 'admin');
$$ language sql security definer;

create policy "Admins have full access to users" on public.users for all using (auth.is_admin());
create policy "Admins have full access to address" on public.addresses for all using (auth.is_admin());
create policy "Admins have full access to categories" on public.categories for all using (auth.is_admin());
create policy "Admins have full access to brands" on public.brands for all using (auth.is_admin());
create policy "Admins have full access to products" on public.products for all using (auth.is_admin());
create policy "Admins have full access to galleries" on public.product_gallery for all using (auth.is_admin());
create policy "Admins have full access to orders" on public.orders for all using (auth.is_admin());
create policy "Admins have full access to order_items" on public.order_items for all using (auth.is_admin());
create policy "Admins have full access to reviews" on public.reviews for all using (auth.is_admin());


-- ==========================================
-- TRIGGERS
-- ==========================================

-- 1. Auto-create user profile when someone signs up in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (user_id, email, role)
  values (new.id, new.email, 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Trigger for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_users_updated_at before update on public.users for each row execute procedure public.set_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute procedure public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
create trigger set_addresses_updated_at before update on public.addresses for each row execute procedure public.set_updated_at();


-- ==========================================
-- SEED DATA (MOCK)
-- ==========================================
insert into public.categories (category_name, slug) values
  ('Vitamins & Supplements', 'vitamins-supplements'),
  ('Sports Nutrition', 'sports-nutrition'),
  ('Herbal & Homeopathy', 'herbal-homeopathy');

insert into public.brands (brand_name, slug, description) values
  ('Nature''s Bounty', 'natures-bounty', 'Premium vitamins and supplements.'),
  ('Optimum Nutrition', 'optimum-nutrition', 'High quality fitness supplements.');

-- Note: We omit seeding Cart/CartItems because we'll rely on local storage or Zustand for anonymous carts, 
-- and only convert to true Orders at checkout.

-- Finally, create a storage bucket for product images
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict do nothing;
