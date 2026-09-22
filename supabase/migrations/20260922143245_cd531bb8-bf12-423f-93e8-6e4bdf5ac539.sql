drop policy if exists "Public can read storage objects" on storage.objects;

create policy "Public can read software downloads"
on storage.objects
for select
to public
using (bucket_id = 'Software');