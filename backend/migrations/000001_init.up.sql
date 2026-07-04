create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key,
  email text not null unique,
  name text not null,
  avatar_url text not null default '',
  google_id text not null unique,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table pages (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  slug text not null unique,
  template text not null,
  content jsonb not null,
  is_published boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint pages_template_check check (template in ('minimal-grid')),
  constraint pages_content_version_check check ((content->>'version')::int = 1)
);

create index pages_user_id_updated_at_idx on pages(user_id, updated_at desc);
create index pages_published_slug_idx on pages(slug) where is_published = true;
create index pages_content_gin_idx on pages using gin(content);

create table media (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  url text not null,
  public_id text not null,
  width int not null,
  height int not null,
  format text not null,
  created_at timestamptz not null
);

create index media_user_id_created_at_idx on media(user_id, created_at desc);
