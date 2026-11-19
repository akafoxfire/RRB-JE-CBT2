-- Supabase > SQL Editor me paste karke Run karo. OWNER@gmail.com ko apne Google email se badlo (2 jagah, neeche replace-all karo).
create table if not exists notes(id uuid primary key default gen_random_uuid(), subject int not null, title text not null, path text not null, size bigint, created_at timestamptz default now());
create table if not exists user_data(uid uuid primary key references auth.users on delete cascade, data jsonb not null default '{}', updated_at timestamptz default now());
alter table notes enable row level security; alter table user_data enable row level security;
create policy "notes sab dekh sakte" on notes for select using (true);
create policy "notes sirf owner" on notes for all using (auth.jwt()->>'email'='OWNER@gmail.com') with check (auth.jwt()->>'email'='OWNER@gmail.com');
create policy "apna data" on user_data for all using (auth.uid()=uid) with check (auth.uid()=uid);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('notes','notes',true,52428800,array['application/pdf']) on conflict do nothing;
create policy "files sirf owner" on storage.objects for all using (bucket_id='notes' and auth.jwt()->>'email'='OWNER@gmail.com') with check (bucket_id='notes' and auth.jwt()->>'email'='OWNER@gmail.com');
