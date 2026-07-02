create table if not exists app_meta (
  id text primary key,
  name text not null,
  slug text not null unique,
  path text not null,
  url text not null,
  category text not null,
  runtime text not null,
  visibility text not null,
  status text not null,
  accent text not null,
  icon text not null,
  notes text not null,
  sort_order integer not null default 100,
  created_at text not null,
  updated_at text not null,
  deleted_at text
);

create table if not exists grocery_items (
  id text primary key,
  name text not null,
  list_type text not null,
  status text not null,
  category text not null,
  quantity text not null,
  notes text not null,
  aisle text not null,
  modified_by text not null,
  last_purchased_at text,
  sort_order integer not null default 100,
  created_at text not null,
  updated_at text not null,
  deleted_at text
);

create index if not exists idx_app_meta_live on app_meta(status, sort_order, name)
  where deleted_at is null;

create index if not exists idx_grocery_items_active on grocery_items(status, list_type, category, name)
  where deleted_at is null;
