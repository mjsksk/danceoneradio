import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Called by the local SAM resolver to report a match result for a request.
// Sets sam_filename, matched_artist, matched_title, match_confidence, match_method.

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("METHOD_NOT_ALLOWED=1\n", { status: 405, headers: { "Content-Type": "text/plain" } });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token") || req.headers.get("x-api-key") || "";
  const expectedToken = Deno.env.get("SAM_API_TOKEN");

  if (!expectedToken || token !== expectedToken) {
    return new Response("ERROR=UNAUTHORIZED\n", { status: 401, headers: { "Content-Type": "text/plain" } });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response("ERROR=INVALID_JSON\n", { status: 400, headers: { "Content-Type": "text/plain" } });
  }

  const requestId = body.request_id as string;
  const samFilename = body.sam_filename as string;
  const matchedArtist = (body.matched_artist as string) || null;
  const matchedTitle = (body.matched_title as string) || null;
  const matchConfidence = (body.match_confidence as number) || 100;
  const matchMethod = (body.match_method as string) || "local-sam-resolver";
  const noMatch = body.no_match === true;

  if (!requestId) {
    return new Response("ERROR=MISSING_REQUEST_ID\n", { status: 400, headers: { "Content-Type": "text/plain" } });
  }

  if (!noMatch && !samFilename) {
    return new Response("ERROR=MISSING_SAM_FILENAME\n", { status: 400, headers: { "Content-Type": "text/plain" } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (noMatch) {
    // Mark as no-match so it won't keep appearing
    const { error } = await supabase
      .from("song_requests")
      .update({
        match_method: "no-match-local",
        match_confidence: 0,
        match_reason: (body.reason as string) || "No match found in local SAM database",
      })
      .eq("id", requestId);

    if (error) {
      console.error("Update error:", error);
      return new Response("ERROR=DB_FAILURE\n", { status: 500, headers: { "Content-Type": "text/plain" } });
    }

    return new Response("OK=1\nMATCH=NO\n", { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  const { error } = await supabase
    .from("song_requests")
    .update({
      sam_filename: samFilename.trim(),
      matched_artist: matchedArtist,
      matched_title: matchedTitle,
      match_confidence: matchConfidence,
      match_method: matchMethod,
      match_reason: "Matched by local SAM resolver against live samdb",
    })
    .eq("id", requestId);

  if (error) {
    console.error("Update error:", error);
    return new Response("ERROR=DB_FAILURE\n", { status: 500, headers: { "Content-Type": "text/plain" } });
  }

  return new Response(`OK=1\nMATCH=YES\nFILE=${samFilename.trim()}\n`, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
});
