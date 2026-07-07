import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_episodes",
  title: "List podcast episodes",
  description:
    "List Dance One Radio podcast episodes (episode numbers with track counts), newest first. Each episode has a page at https://danceoneradio.com/episode/<episode_number>.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Number of episodes to return (default 20, max 50)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );
    const { data, error } = await supabase
      .from("show_tracks")
      .select("episode_number")
      .order("episode_number", { ascending: false });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    const counts = new Map<number, number>();
    for (const row of data ?? []) {
      counts.set(row.episode_number, (counts.get(row.episode_number) ?? 0) + 1);
    }
    const episodes = Array.from(counts.entries())
      .sort((a, b) => b[0] - a[0])
      .slice(0, limit ?? 20)
      .map(([episode_number, track_count]) => ({
        episode_number,
        track_count,
        url: `https://danceoneradio.com/episode/${episode_number}`,
      }));
    return {
      content: [{ type: "text", text: JSON.stringify(episodes) }],
      structuredContent: { episodes },
    };
  },
});
