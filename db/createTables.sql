-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist
drop table if exists todos cascade;
drop table if exists profiles cascade;

-- Create profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create todos table with user relationship
create table todos (
  id uuid default uuid_generate_v4() primary key,
  text text not null,
  description text,
  completed boolean default false,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  status text check (status in ('todo', 'in_progress', 'completed')) default 'todo',
  due_date timestamptz,
  created_at timestamptz default now(),
  user_id uuid references profiles(id) on delete cascade not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table todos enable row level security;

-- Create policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Create policies for todos
create policy "Users can view own todos"
  on todos for select
  using (auth.uid() = user_id);

create policy "Users can create own todos"
  on todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on todos for update
  using (auth.uid() = user_id);

create policy "Users can delete own todos"
  on todos for delete
  using (auth.uid() = user_id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();