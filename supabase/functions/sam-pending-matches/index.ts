import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Returns approved requests not yet imported by the SAM PC.
// The local SAM resolver polls this endpoint to find requests needing processing.

Deno.serve(async (req: Request) => {
  if (req.method !== "GET") {
    return new Response("METHOD_NOT_ALLOWED=1\n", { status: 405, headers: { "Content-Type": "text/plain" } });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token") || req.headers.get("x-api-key") || "";
  const expectedToken = Deno.env.get("SAM_API_TOKEN");

  if (!expectedToken || token !== expectedToken) {
    return new Response("ERROR=UNAUTHORIZED\n", { status: 401, headers: { "Content-Type": "text/plain" } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const limit = parseInt(url.searchParams.get("limit") || "10", 10);

  const { data, error } = await supabase
    .from("song_requests")
    .select("id, artist_name, song_title, listener_name, message, created_at")
    .eq("status", "approved")
    .is("sam_imported_at", null)
    .order("created_at", { ascending: true })
    .limit(Math.min(Math.max(limit, 1), 50));

  if (error) {
    console.error("DB error:", error);
    return new Response("ERROR=DB_FAILURE\n", { status: 500, headers: { "Content-Type": "text/plain" } });
  }

  if (!data || data.length === 0) {
    return new Response("COUNT=0\n", { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  let body = `COUNT=${data.length}\n`;
  for (const row of data) {
    const sanitize = (val: string | null) => (val || "").replace(/[\r\n]+/g, " ").trim();
    body += `REQUEST_ID=${row.id}\n`;
    body += `ARTIST=${sanitize(row.artist_name)}\n`;
    body += `TITLE=${sanitize(row.song_title)}\n`;
    body += `LISTENER=${sanitize(row.listener_name)}\n`;
    body += `MESSAGE=${sanitize(row.message)}\n`;
    body += `---\n`;
  }

  return new Response(body, { status: 200, headers: { "Content-Type": "text/plain" } });
});
