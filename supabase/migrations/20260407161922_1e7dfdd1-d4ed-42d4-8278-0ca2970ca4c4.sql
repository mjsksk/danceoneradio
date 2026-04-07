create extension if not exists pg_trgm with schema extensions;

create or replace function public.normalize_match_value(value text)
returns text
language sql
immutable
set search_path to ''
as $$
  select lower(
    trim(
      regexp_replace(
        regexp_replace(
          regexp_replace(coalesce(value, ''), '\.mp3$', '', 'gi'),
          '[^a-z0-9]+',
          ' ',
          'gi'
        ),
        '\s+',
        ' ',
        'g'
      )
    )
  );
$$;

create or replace function public.normalize_match_value_nospace(value text)
returns text
language sql
immutable
set search_path to ''
as $$
  select replace(public.normalize_match_value(value), ' ', '');
$$;

create or replace function public.basename_text(value text)
returns text
language sql
immutable
set search_path to ''
as $$
  select btrim(regexp_replace(coalesce(value, ''), '^.*[\\/]', ''));
$$;

create or replace function public.library_filename_stem(value text)
returns text
language sql
immutable
set search_path to ''
as $$
  select regexp_replace(public.basename_text(value), '\.mp3$', '', 'gi');
$$;

create or replace function public.library_filename_artist(value text)
returns text
language sql
immutable
set search_path to ''
as $$
  with stem as (
    select public.library_filename_stem(value) as stem
  )
  select case
    when strpos(stem, '-') > 0 then trim(split_part(stem, '-', 1))
    else ''
  end
  from stem;
$$;

create or replace function public.library_filename_title(value text)
returns text
language sql
immutable
set search_path to ''
as $$
  with stem as (
    select public.library_filename_stem(value) as stem
  )
  select case
    when strpos(stem, '-') > 0 then trim(substr(stem, strpos(stem, '-') + 1))
    else trim(stem)
  end
  from stem;
$$;

create or replace function public.effective_library_artist(artist text, filename text)
returns text
language sql
immutable
set search_path to ''
as $$
  with stem as (
    select public.library_filename_stem(filename) as stem
  )
  select case
    when strpos(stem, '-') > 0 then public.library_filename_artist(filename)
    when nullif(trim(coalesce(artist, '')), '') is not null then trim(artist)
    else ''
  end
  from stem;
$$;

create or replace function public.effective_library_title(title text, filename text)
returns text
language sql
immutable
set search_path to ''
as $$
  with stem as (
    select public.library_filename_stem(filename) as stem
  )
  select case
    when strpos(stem, '-') > 0 then public.library_filename_title(filename)
    when nullif(trim(coalesce(title, '')), '') is not null then trim(title)
    else trim(stem)
  end
  from stem;
$$;

alter table public.sam_library
  add column if not exists artist_norm text generated always as (public.normalize_match_value(public.effective_library_artist(artist, filename))) stored,
  add column if not exists artist_key text generated always as (public.normalize_match_value_nospace(public.effective_library_artist(artist, filename))) stored,
  add column if not exists title_norm text generated always as (public.normalize_match_value(public.effective_library_title(title, filename))) stored,
  add column if not exists title_key text generated always as (public.normalize_match_value_nospace(public.effective_library_title(title, filename))) stored,
  add column if not exists full_key text generated always as (
    public.normalize_match_value_nospace(public.effective_library_artist(artist, filename)) ||
    public.normalize_match_value_nospace(public.effective_library_title(title, filename))
  ) stored;

alter table public.song_requests
  add column if not exists req_artist_norm text generated always as (public.normalize_match_value(artist_name)) stored,
  add column if not exists req_artist_key text generated always as (public.normalize_match_value_nospace(artist_name)) stored,
  add column if not exists req_title_norm text generated always as (public.normalize_match_value(song_title)) stored,
  add column if not exists req_title_key text generated always as (public.normalize_match_value_nospace(song_title)) stored,
  add column if not exists req_full_key text generated always as (
    public.normalize_match_value_nospace(coalesce(artist_name, '') || ' ' || coalesce(song_title, ''))
  ) stored;

create index if not exists idx_sam_library_artist_key on public.sam_library (artist_key);
create index if not exists idx_sam_library_title_key on public.sam_library (title_key);
create index if not exists idx_sam_library_title_key_trgm on public.sam_library using gin (title_key gin_trgm_ops);
create index if not exists idx_sam_library_full_key_trgm on public.sam_library using gin (full_key gin_trgm_ops);
create index if not exists idx_song_requests_sam_eligible on public.song_requests (created_at)
where status = 'approved' and sam_imported_at is null and sam_filename is not null;

create or replace function public.sync_sam_library_normalized_fields()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  new.filename := btrim(coalesce(new.filename, ''));
  new.artist := public.effective_library_artist(new.artist, new.filename);
  new.title := public.effective_library_title(new.title, new.filename);
  new.normalized_artist := public.normalize_match_value(new.artist);
  new.normalized_artist_nospace := public.normalize_match_value_nospace(new.artist);
  new.normalized_title := public.normalize_match_value(new.title);
  new.normalized_title_nospace := public.normalize_match_value_nospace(new.title);
  return new;
end;
$$;

drop trigger if exists trg_sync_sam_library_normalized_fields on public.sam_library;
create trigger trg_sync_sam_library_normalized_fields
before insert or update of artist, title, filename on public.sam_library
for each row
execute function public.sync_sam_library_normalized_fields();

create or replace function public.get_song_request_debug_candidates_by_values(
  _req_artist_norm text,
  _req_artist_key text,
  _req_title_norm text,
  _req_title_key text,
  _req_full_key text,
  _candidate_limit integer default 5
)
returns table(
  library_id uuid,
  artist text,
  title text,
  relativefile text,
  artist_norm text,
  artist_key text,
  title_norm text,
  title_key text,
  full_key text,
  confidence integer,
  match_method text,
  priority integer,
  similarity_score numeric
)
language sql
stable
security definer
set search_path to ''
as $$
  with req as (
    select
      coalesce(_req_artist_norm, '') as req_artist_norm,
      coalesce(_req_artist_key, '') as req_artist_key,
      coalesce(_req_title_norm, '') as req_title_norm,
      coalesce(_req_title_key, '') as req_title_key,
      coalesce(_req_full_key, '') as req_full_key
  ),
  ranked as (
    select
      lib.id as library_id,
      public.effective_library_artist(lib.artist, lib.filename) as artist,
      public.effective_library_title(lib.title, lib.filename) as title,
      btrim(lib.filename) as relativefile,
      lib.artist_norm,
      lib.artist_key,
      lib.title_norm,
      lib.title_key,
      lib.full_key,
      extensions.similarity(req.req_full_key, lib.full_key) as similarity_score,
      case
        when req.req_artist_key <> ''
         and req.req_title_key <> ''
         and req.req_artist_key = lib.artist_key
         and req.req_title_key = lib.title_key then 1
        when req.req_title_key <> ''
         and req.req_title_key = lib.title_key then 2
        when req.req_title_key <> ''
         and (
           lib.title_key like '%' || req.req_title_key || '%'
           or req.req_title_key like '%' || lib.title_key || '%'
         ) then 3
        when req.req_full_key <> ''
         and extensions.similarity(req.req_full_key, lib.full_key) >= 0.20 then 4
        else null
      end as priority,
      req.req_artist_key,
      req.req_title_key
    from req
    cross join public.sam_library lib
    where req.req_title_key <> ''
  ),
  filtered as (
    select
      library_id,
      artist,
      title,
      relativefile,
      artist_norm,
      artist_key,
      title_norm,
      title_key,
      full_key,
      case priority
        when 1 then 100
        when 2 then 90
        when 3 then 70
        when 4 then greatest(50, least(69, floor(similarity_score * 100)::integer))
      end as confidence,
      case priority
        when 1 then 'priority-1-exact-artist-title-key'
        when 2 then 'priority-2-exact-title-key'
        when 3 then 'priority-3-title-contains'
        when 4 then 'priority-4-full-key-trgm'
      end as match_method,
      priority,
      similarity_score,
      req_artist_key,
      req_title_key
    from ranked
    where priority is not null
  )
  select
    library_id,
    artist,
    title,
    relativefile,
    artist_norm,
    artist_key,
    title_norm,
    title_key,
    full_key,
    confidence,
    match_method,
    priority,
    similarity_score
  from filtered
  order by
    priority asc,
    confidence desc,
    case when priority = 2 then abs(char_length(artist_key) - char_length(req_artist_key)) else 0 end asc,
    case when priority = 3 then abs(char_length(title_key) - char_length(req_title_key)) else 0 end asc,
    similarity_score desc nulls last,
    relativefile asc
  limit greatest(coalesce(_candidate_limit, 5), 1);
$$;

create or replace function public.get_song_request_debug_candidates(
  _request_id uuid,
  _candidate_limit integer default 5
)
returns table(
  library_id uuid,
  artist text,
  title text,
  relativefile text,
  artist_norm text,
  artist_key text,
  title_norm text,
  title_key text,
  full_key text,
  confidence integer,
  match_method text,
  priority integer,
  similarity_score numeric
)
language sql
stable
security definer
set search_path to ''
as $$
  select c.*
  from public.song_requests sr
  cross join lateral public.get_song_request_debug_candidates_by_values(
    sr.req_artist_norm,
    sr.req_artist_key,
    sr.req_title_norm,
    sr.req_title_key,
    sr.req_full_key,
    _candidate_limit
  ) c
  where sr.id = _request_id;
$$;

create or replace function public.sync_song_request_normalized_fields_and_match()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_req_artist_norm text;
  v_req_artist_key text;
  v_req_title_norm text;
  v_req_title_key text;
  v_req_full_key text;
  best record;
  candidate_json jsonb := '[]'::jsonb;
begin
  new.artist_name := btrim(coalesce(new.artist_name, ''));
  new.song_title := btrim(coalesce(new.song_title, ''));

  v_req_artist_norm := public.normalize_match_value(new.artist_name);
  v_req_artist_key := public.normalize_match_value_nospace(new.artist_name);
  v_req_title_norm := public.normalize_match_value(new.song_title);
  v_req_title_key := public.normalize_match_value_nospace(new.song_title);
  v_req_full_key := v_req_artist_key || v_req_title_key;

  new.normalized_request_artist := v_req_artist_norm;
  new.normalized_request_artist_nospace := v_req_artist_key;
  new.normalized_request_title := v_req_title_norm;
  new.normalized_request_title_nospace := v_req_title_key;
  new.normalized_artist_name := v_req_artist_norm;
  new.normalized_song_title := v_req_title_norm;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'library_id', c.library_id,
        'artist', c.artist,
        'title', c.title,
        'relativefile', c.relativefile,
        'artist_norm', c.artist_norm,
        'artist_key', c.artist_key,
        'title_norm', c.title_norm,
        'title_key', c.title_key,
        'full_key', c.full_key,
        'confidence', c.confidence,
        'match_method', c.match_method,
        'priority', c.priority,
        'similarity_score', c.similarity_score
      )
      order by c.priority asc, c.confidence desc, c.relativefile asc
    ),
    '[]'::jsonb
  )
  into candidate_json
  from public.get_song_request_debug_candidates_by_values(
    v_req_artist_norm,
    v_req_artist_key,
    v_req_title_norm,
    v_req_title_key,
    v_req_full_key,
    5
  ) c;

  select *
  into best
  from public.get_song_request_debug_candidates_by_values(
    v_req_artist_norm,
    v_req_artist_key,
    v_req_title_norm,
    v_req_title_key,
    v_req_full_key,
    1
  )
  limit 1;

  new.match_candidates := candidate_json;

  if best is null then
    new.matched_artist := null;
    new.matched_title := null;
    new.sam_filename := null;
    new.match_confidence := 0;
    new.match_method := 'no-match';
    new.match_reason := case
      when exists (select 1 from public.sam_library) then 'No library candidates matched the normalized request keys.'
      else 'SAM library is empty.'
    end;
  elsif best.priority = 1 then
    new.matched_artist := best.artist;
    new.matched_title := best.title;
    new.sam_filename := nullif(btrim(best.relativefile), '');
    new.match_confidence := best.confidence;
    new.match_method := 'auto-matched';
    new.match_reason := best.match_method;
  else
    new.matched_artist := null;
    new.matched_title := null;
    new.sam_filename := null;
    new.match_confidence := best.confidence;
    new.match_method := 'needs-review';
    new.match_reason := best.match_method;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_song_request_normalized_fields_and_match on public.song_requests;
create trigger trg_sync_song_request_normalized_fields_and_match
before insert or update of artist_name, song_title on public.song_requests
for each row
execute function public.sync_song_request_normalized_fields_and_match();

create or replace function public.apply_song_request_match(_request_id uuid)
returns table(
  id uuid,
  match_method text,
  match_confidence integer,
  matched_artist text,
  matched_title text,
  sam_filename text,
  candidates_count integer,
  no_match_reason text,
  normalized_request_artist text,
  normalized_request_artist_nospace text,
  normalized_request_title text,
  normalized_request_title_nospace text,
  match_candidates jsonb
)
language sql
security definer
set search_path to ''
as $$
  with updated as (
    update public.song_requests
    set artist_name = public.song_requests.artist_name,
        song_title = public.song_requests.song_title
    where public.song_requests.id = _request_id
    returning public.song_requests.*
  )
  select
    u.id,
    u.match_method,
    coalesce(u.match_confidence, 0)::integer as match_confidence,
    u.matched_artist,
    u.matched_title,
    u.sam_filename,
    jsonb_array_length(coalesce(u.match_candidates, '[]'::jsonb)) as candidates_count,
    u.match_reason as no_match_reason,
    u.normalized_request_artist,
    u.normalized_request_artist_nospace,
    u.normalized_request_title,
    u.normalized_request_title_nospace,
    u.match_candidates
  from updated u;
$$;

create or replace function public.apply_song_request_matches(_request_ids uuid[] default null::uuid[])
returns table(
  id uuid,
  match_method text,
  match_confidence integer,
  matched_artist text,
  matched_title text,
  sam_filename text,
  candidates_count integer,
  no_match_reason text,
  normalized_request_artist text,
  normalized_request_artist_nospace text,
  normalized_request_title text,
  normalized_request_title_nospace text,
  match_candidates jsonb
)
language sql
security definer
set search_path to ''
as $$
  with target as (
    select sr.id
    from public.song_requests sr
    where coalesce(array_length(_request_ids, 1), 0) = 0
       or sr.id = any(_request_ids)
    order by sr.created_at asc
    limit 500
  ),
  updated as (
    update public.song_requests sr
    set artist_name = sr.artist_name,
        song_title = sr.song_title
    from target t
    where sr.id = t.id
    returning sr.*
  )
  select
    u.id,
    u.match_method,
    coalesce(u.match_confidence, 0)::integer as match_confidence,
    u.matched_artist,
    u.matched_title,
    u.sam_filename,
    jsonb_array_length(coalesce(u.match_candidates, '[]'::jsonb)) as candidates_count,
    u.match_reason as no_match_reason,
    u.normalized_request_artist,
    u.normalized_request_artist_nospace,
    u.normalized_request_title,
    u.normalized_request_title_nospace,
    u.match_candidates
  from updated u
  order by u.created_at asc;
$$;