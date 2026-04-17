-- Supabase → SQL Editor에 붙여 넣어 한 번에 실행하세요.
-- (먼저 Authentication → Providers에서 Anonymous sign-in을 켜야 합니다.)

-- 프로필 (표시 이름)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);

-- 추가한 친구 + 구독(데모) 상태
create table if not exists public.added_friends (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id text not null,
  subscribed boolean not null default false,
  primary key (user_id, friend_id)
);

alter table public.added_friends enable row level security;

create policy "added_friends_all" on public.added_friends
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 대화 메시지
create table if not exists public.chat_messages (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at bigint not null
);

create index if not exists chat_messages_user_friend_idx
  on public.chat_messages (user_id, friend_id);

alter table public.chat_messages enable row level security;

create policy "chat_messages_all" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 릴 좋아요
create table if not exists public.slide_likes (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id text not null,
  slide_index int not null,
  liked boolean not null default false,
  primary key (user_id, friend_id, slide_index)
);

alter table public.slide_likes enable row level security;

create policy "slide_likes_all" on public.slide_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
