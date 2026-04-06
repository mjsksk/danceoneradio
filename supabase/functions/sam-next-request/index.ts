import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

Deno.serve(async (req: Request) => {
  // Only allow GET
  if (req.method !== "GET") {
    return new Response("METHOD_NOT_ALLOWED=1\n", { status: 405, headers: { "Content-Type": "text/plain" } });
  }

  // Auth: check token from query param or header
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || req.headers.get("x-api-key") || "";
  const expectedToken = Deno.env.get("SAM_API_TOKEN");

  if (!expectedToken || token !== expectedToken) {
    return new Response("ERROR=UNAUTHORIZED\n", { status: 401, headers: { "Content-Type": "text/plain" } });
  }

  // Query oldest approved, not-yet-imported request
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("song_requests")
    .select("id, artist_name, song_title, listener_name, message, sam_filename")
    .eq("status", "approved")
    .is("sam_imported_at", null)
    .not("sam_filename", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return new Response("ERROR=DB_FAILURE\n", { status: 500, headers: { "Content-Type": "text/plain" } });
  }

  if (!data) {
    return new Response("NO_REQUEST=1\n", { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  // Sanitize values: strip line breaks so each field stays on one line
  const sanitize = (val: string | null) => (val || "").replace(/[\r\n]+/g, " ").trim();

  let body = `REQUEST_ID=${data.id}\n`;
  body += `ARTIST=${sanitize(data.artist_name)}\n`;
  body += `TITLE=${sanitize(data.song_title)}\n`;
  body += `LISTENER=${sanitize(data.listener_name)}\n`;
  if (data.message) {
    body += `MESSAGE=${sanitize(data.message)}\n`;
  }

  return new Response(body, { status: 200, headers: { "Content-Type": "text/plain" } });
});
