-- Homemade Cake Business - Supabase schema
-- Run this entire file in Supabase Dashboard -> SQL Editor.

create sequence if not exists public.order_no_seq start 1;

create table if not exists public.orders (
    order_id bigint generated always as identity primary key,
    order_no varchar(30) unique not null default (
        'ORD-' || lpad(nextval('public.order_no_seq')::text, 5, '0')
    ),
    cake_name varchar(200) not null,
    customer_name varchar(150) not null,
    mobile_number varchar(20) not null,
    order_date date not null default current_date,
    delivery_date date not null,
    price numeric(12,2) not null default 0 check (price >= 0),
    remarks text,
    status varchar(20) not null default 'Pending' check (status in ('Pending','Delivered','Cancelled')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- If the table was created before the sequence/default above, run:
-- alter table public.orders alter column order_no set default ('ORD-' || lpad(nextval('public.order_no_seq')::text, 5, '0'));

create sequence if not exists public.bill_no_seq start 1;

create table if not exists public.sales_bills (
    sales_bill_id bigint generated always as identity primary key,
    bill_no varchar(30) unique not null default (
        'BILL-' || lpad(nextval('public.bill_no_seq')::text, 5, '0')
    ),
    order_id bigint not null unique references public.orders(order_id) on update cascade on delete restrict,
    actual_delivery_date date not null,
    actual_price numeric(12,2) not null default 0 check (actual_price >= 0),
    cake_image_path text,
    remarks text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- If the table was created before the sequence/default above, run:
-- alter table public.sales_bills alter column bill_no set default ('BILL-' || lpad(nextval('public.bill_no_seq')::text, 5, '0'));

create index if not exists idx_orders_order_date on public.orders(order_date);
create index if not exists idx_orders_delivery_date on public.orders(delivery_date);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_sales_bills_delivery_date on public.sales_bills(actual_delivery_date);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_sales_bills_updated_at on public.sales_bills;
create trigger trg_sales_bills_updated_at
before update on public.sales_bills
for each row execute function public.set_updated_at();

-- RLS
alter table public.orders enable row level security;
alter table public.sales_bills enable row level security;

drop policy if exists "authenticated users can read orders" on public.orders;
create policy "authenticated users can read orders"
on public.orders for select to authenticated using (true);

drop policy if exists "authenticated users can insert orders" on public.orders;
create policy "authenticated users can insert orders"
on public.orders for insert to authenticated with check (true);

drop policy if exists "authenticated users can update orders" on public.orders;
create policy "authenticated users can update orders"
on public.orders for update to authenticated using (true) with check (true);

drop policy if exists "authenticated users can delete orders" on public.orders;
create policy "authenticated users can delete orders"
on public.orders for delete to authenticated using (true);

drop policy if exists "authenticated users can read sales bills" on public.sales_bills;
create policy "authenticated users can read sales bills"
on public.sales_bills for select to authenticated using (true);

drop policy if exists "authenticated users can insert sales bills" on public.sales_bills;
create policy "authenticated users can insert sales bills"
on public.sales_bills for insert to authenticated with check (true);

drop policy if exists "authenticated users can update sales bills" on public.sales_bills;
create policy "authenticated users can update sales bills"
on public.sales_bills for update to authenticated using (true) with check (true);

drop policy if exists "authenticated users can delete sales bills" on public.sales_bills;
create policy "authenticated users can delete sales bills"
on public.sales_bills for delete to authenticated using (true);

-- Storage bucket for private cake photos.
insert into storage.buckets (id, name, public)
values ('cake-images', 'cake-images', false)
on conflict (id) do update set public = false;

drop policy if exists "authenticated users can upload cake images" on storage.objects;
create policy "authenticated users can upload cake images"
on storage.objects for insert to authenticated
with check (bucket_id = 'cake-images');

drop policy if exists "authenticated users can view cake images" on storage.objects;
create policy "authenticated users can view cake images"
on storage.objects for select to authenticated
using (bucket_id = 'cake-images');

drop policy if exists "authenticated users can update cake images" on storage.objects;
create policy "authenticated users can update cake images"
on storage.objects for update to authenticated
using (bucket_id = 'cake-images')
with check (bucket_id = 'cake-images');

drop policy if exists "authenticated users can delete cake images" on storage.objects;
create policy "authenticated users can delete cake images"
on storage.objects for delete to authenticated
using (bucket_id = 'cake-images');
