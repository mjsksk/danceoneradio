import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/corsHeaders.ts";

// Normalization: lowercase, trim, collapse spaces, strip extension, strip common suffixes, strip punctuation
function normalize(input: string): string {
  let s = input.toLowerCase().trim();
  // Remove file extension
  s = s.replace(/\.(mp3|wav|flac|aac|ogg|m4a|wma)$/i, "");
  // Remove common suffixes in parens/brackets
  s = s.replace(/[\(\[](radio edit|original mix|extended mix|club mix|remix|vocal mix|dub mix|instrumental|clean|dirty|explicit|feat\.?[^)\]]*|ft\.?[^)\]]*)[\)\]]/gi, "");
  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  // Remove punctuation except spaces and alphanumeric
  s = s.replace(/[^a-z0-9\s]/g, "");
  // Collapse spaces again
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

// No-space version for catching cases like "AmaxDj" vs "Amax DJ"
function normalizeNospace(input: string): string {
  return normalize(input).replace(/\s+/g, "");
}

// Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

interface LibraryTrack {
  id: string;
  artist: string;
  title: string;
  filename: string;
  normalized_artist: string;
  normalized_title: string;
}

interface MatchCandidate {
  library_id: string;
  artist: string;
  title: string;
  filename: string;
  confidence: number;
  method: string;
}

function findMatches(
  reqArtist: string,
  reqTitle: string,
  library: LibraryTrack[]
): MatchCandidate[] {
  const normArtist = normalize(reqArtist);
  const normTitle = normalize(reqTitle);
  const normCombined = `${normArtist} ${normTitle}`;
  const nospaceArtist = normalizeNospace(reqArtist);
  const nospaceTitle = normalizeNospace(reqTitle);

  const candidates: MatchCandidate[] = [];

  for (const track of library) {
    const libArtist = track.normalized_artist;
    const libTitle = track.normalized_title;
    const libCombined = `${libArtist} ${libTitle}`;
    const libFilenameNorm = normalize(track.filename);
    const libArtistNospace = libArtist.replace(/\s+/g, "");
    const libTitleNospace = libTitle.replace(/\s+/g, "");

    // 1. Exact normalized match (spaced)
    if (normArtist === libArtist && normTitle === libTitle) {
      candidates.push({
        library_id: track.id,
        artist: track.artist,
        title: track.title,
        filename: track.filename.trim(),
        confidence: 1.0,
        method: "exact",
      });
      continue;
    }

    // 2. Exact no-space match (catches "AmaxDj" vs "Amax DJ")
    if (nospaceArtist === libArtistNospace && nospaceTitle === libTitleNospace) {
      candidates.push({
        library_id: track.id,
        artist: track.artist,
        title: track.title,
        filename: track.filename.trim(),
        confidence: 0.98,
        method: "exact-nospace",
      });
      continue;
    }

    // 3. Title exact match + artist nospace match
    if (normTitle === libTitle && nospaceArtist === libArtistNospace) {
      candidates.push({
        library_id: track.id,
        artist: track.artist,
        title: track.title,
        filename: track.filename.trim(),
        confidence: 0.97,
        method: "title-exact-artist-nospace",
      });
      continue;
    }

    // 4. Title-contains match (highest priority partial match)
    if (
      normTitle.length >= 3 &&
      (libTitle.includes(normTitle) || normTitle.includes(libTitle) || libFilenameNorm.includes(normTitle))
    ) {
      // Bonus if artist also matches (spaced or nospace)
      const artistMatch = (normArtist.length >= 2 && (
        libArtist.includes(normArtist) || 
        libCombined.includes(normArtist) ||
        nospaceArtist === libArtistNospace ||
        libArtistNospace.includes(nospaceArtist)
      ));
      const conf = artistMatch ? 0.95 : 0.90;
      candidates.push({
        library_id: track.id,
        artist: track.artist,
        title: track.title,
        filename: track.filename.trim(),
        confidence: conf,
        method: artistMatch ? "title-contains+artist" : "title-contains",
      });
      continue;
    }

    // 5. Nospace title contains
    if (
      nospaceTitle.length >= 3 &&
      (libTitleNospace.includes(nospaceTitle) || nospaceTitle.includes(libTitleNospace))
    ) {
      const artistMatch = nospaceArtist === libArtistNospace || libArtistNospace.includes(nospaceArtist);
      const conf = artistMatch ? 0.93 : 0.88;
      candidates.push({
        library_id: track.id,
        artist: track.artist,
        title: track.title,
        filename: track.filename.trim(),
        confidence: conf,
        method: "nospace-title-contains",
      });
      continue;
    }

    // 6. Artist+title combined contains match
    if (
      (libCombined.includes(normArtist) && libCombined.includes(normTitle)) ||
      (normCombined.includes(libArtist) && normCombined.includes(libTitle))
    ) {
      candidates.push({
        library_id: track.id,
        artist: track.artist,
        title: track.title,
        filename: track.filename.trim(),
        confidence: 0.85,
        method: "contains",
      });
      continue;
    }

    // 7. Fuzzy similarity (both spaced and nospace)
    const artistSim = Math.max(similarity(normArtist, libArtist), similarity(nospaceArtist, libArtistNospace));
    const titleSim = Math.max(similarity(normTitle, libTitle), similarity(nospaceTitle, libTitleNospace));
    const combinedSim = similarity(normCombined, libCombined);
    const bestSim = Math.max((artistSim * 0.4 + titleSim * 0.6), combinedSim);

    if (bestSim >= 0.6) {
      candidates.push({
        library_id: track.id,
        artist: track.artist,
        title: track.title,
        filename: track.filename.trim(),
        confidence: Math.round(bestSim * 100) / 100,
        method: "fuzzy",
      });
    }
  }

  // Sort by confidence descending
  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates.slice(0, 5);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { request_ids } = body;

    // Load entire library
    const { data: library, error: libError } = await supabase
      .from("sam_library")
      .select("id, artist, title, filename, normalized_artist, normalized_title");

    if (libError) throw libError;
    if (!library || library.length === 0) {
      return new Response(JSON.stringify({ error: "SAM library is empty. Import tracks first." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load requests to match
    let query = supabase
      .from("song_requests")
      .select("id, artist_name, song_title, status, sam_filename, match_method");

    if (request_ids && request_ids.length > 0) {
      query = query.in("id", request_ids);
    } else {
      query = query.is("match_method", null);
    }

    const { data: requests, error: reqError } = await query.limit(500);
    if (reqError) throw reqError;

    const results: Array<{
      id: string;
      match_method: string;
      match_confidence: number;
      matched_artist: string | null;
      matched_title: string | null;
      sam_filename: string | null;
      candidates_count: number;
      normalized_request: { artist: string; title: string; artist_nospace: string; title_nospace: string };
    }> = [];

    for (const req of requests || []) {
      const candidates = findMatches(req.artist_name, req.song_title, library as LibraryTrack[]);

      const normalizedRequest = {
        artist: normalize(req.artist_name),
        title: normalize(req.song_title),
        artist_nospace: normalizeNospace(req.artist_name),
        title_nospace: normalizeNospace(req.song_title),
      };

      if (candidates.length === 0) {
        await supabase
          .from("song_requests")
          .update({
            match_method: "no-match",
            match_confidence: 0,
            match_candidates: [],
            normalized_artist_name: normalizedRequest.artist,
            normalized_song_title: normalizedRequest.title,
          })
          .eq("id", req.id);

        results.push({
          id: req.id,
          match_method: "no-match",
          match_confidence: 0,
          matched_artist: null,
          matched_title: null,
          sam_filename: null,
          candidates_count: 0,
          normalized_request: normalizedRequest,
        });
        continue;
      }

      const best = candidates[0];
      const isStrongMatch = best.confidence >= 0.85;

      const updateData: Record<string, unknown> = {
        matched_artist: best.artist,
        matched_title: best.title,
        match_confidence: best.confidence,
        match_method: isStrongMatch ? "auto-matched" : "needs-review",
        match_candidates: candidates,
        normalized_artist_name: normalizedRequest.artist,
        normalized_song_title: normalizedRequest.title,
      };

      if (isStrongMatch) {
        updateData.sam_filename = best.filename;
      }

      await supabase
        .from("song_requests")
        .update(updateData)
        .eq("id", req.id);

      results.push({
        id: req.id,
        match_method: isStrongMatch ? "auto-matched" : "needs-review",
        match_confidence: best.confidence,
        matched_artist: best.artist,
        matched_title: best.title,
        sam_filename: isStrongMatch ? best.filename : null,
        candidates_count: candidates.length,
        normalized_request: normalizedRequest,
      });
    }

    return new Response(JSON.stringify({ matched: results.length, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Match error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
