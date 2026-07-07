import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "search_edm_news",
  title: "Search EDM news",
  description:
    "Search Dance One Radio's aggregated EDM news articles by keyword and/or category. Returns title, summary, source, published date, and article URL.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .optional()
      .describe("Optional keyword to match in title or summary."),
    category: z
      .enum(["top_stories", "artists_releases", "festivals_events", "industry_culture"])
      .optional()
      .describe("Optional news category filter."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(30)
      .optional()
      .describe("Number of articles (default 10, max 30)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ query, category, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );
    let q = supabase
      .from("edm_news_articles")
      .select("title, summary, category, source_name, source_url, published_at, slug")
      .order("published_at", { ascending: false })
      .limit(limit ?? 10);
    if (category) q = q.eq("category", category);
    if (query) q = q.or(`title.ilike.%${query}%,summary.ilike.%${query}%`);
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { articles: data },
    };
  },
});
