import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "get_episode_tracklist",
  title: "Get episode tracklist",
  description:
    "Get the full tracklist for a specific Dance One Radio podcast episode, including artist, title, album, and buy/stream links when available.",
  inputSchema: {
    episode_number: z.number().int().min(1).describe("Episode number, e.g. 416."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ episode_number }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );
    const { data, error } = await supabase
      .from("show_tracks")
      .select(
        "track_order, artist, title, album, duration_seconds, apple_music_url, beatport_url, amazon_url",
      )
      .eq("episode_number", episode_number)
      .order("track_order", { ascending: true });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    if (!data || data.length === 0) {
      return {
        content: [{ type: "text", text: `No tracks found for episode ${episode_number}.` }],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: {
        episode_number,
        url: `https://danceoneradio.com/episode/${episode_number}`,
        tracks: data,
      },
    };
  },
});
