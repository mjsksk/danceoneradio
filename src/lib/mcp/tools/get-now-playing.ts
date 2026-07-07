import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_now_playing",
  title: "Get now playing",
  description:
    "Get the track currently playing on the Dance One Radio live stream (title, artist, and album art when available).",
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async () => {
    const url = `${process.env.SUPABASE_URL}/functions/v1/stream-metadata`;
    const res = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
        Authorization: `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY ?? ""}`,
      },
    });
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Failed to fetch now playing (${res.status})` }],
        isError: true,
      };
    }
    const data = await res.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: data,
    };
  },
});
