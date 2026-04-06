import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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

  const { data, error } = await supabase
    .from("song_requests")
    .select("id, sam_filename")
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

  const sanitize = (val: string | null) => (val || "").replace(/[\r\n]+/g, " ").trim();

  const body = `REQUEST_ID=${data.id}\nRELATIVEFILE=${sanitize(data.sam_filename)}\n`;

  return new Response(body, { status: 200, headers: { "Content-Type": "text/plain" } });
});
