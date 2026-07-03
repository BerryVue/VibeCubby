create table if not exists push_devices (
  token text primary key,
  platform text not null default 'ios',
  created_at text not null
);
