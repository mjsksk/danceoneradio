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

  const id = url.searchParams.get("id");
  if (!id) {
    return new Response("ERROR=MISSING_ID\n", { status: 400, headers: { "Content-Type": "text/plain" } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("song_requests")
    .update({
      sam_imported_at: new Date().toISOString(),
      status: "queued",
    })
    .eq("id", id)
    .eq("status", "approved")
    .select("id, status")
    .maybeSingle();

  if (error) {
    return new Response("ERROR=DB_FAILURE\n", { status: 500, headers: { "Content-Type": "text/plain" } });
  }

  if (!data) {
    return new Response("ERROR=NOT_FOUND\n", { status: 404, headers: { "Content-Type": "text/plain" } });
  }

  return new Response(`OK=1\nREQUEST_ID=${data.id}\nSTATUS=${data.status}\n`, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
});
