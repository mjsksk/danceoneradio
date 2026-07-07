import { defineMcp } from "@lovable.dev/mcp-js";
import getNowPlaying from "./tools/get-now-playing";
import getRecentTracks from "./tools/get-recent-tracks";
import listEpisodes from "./tools/list-episodes";
import getEpisodeTracklist from "./tools/get-episode-tracklist";
import searchNews from "./tools/search-news";

export default defineMcp({
  name: "dance-one-radio-mcp",
  title: "Dance One Radio",
  version: "0.1.0",
  instructions:
    "Tools for Dance One Radio (24/7 electronic dance music radio and podcast). Use `get_now_playing` for the current live stream track, `get_recent_tracks` for recent stream history, `list_episodes` and `get_episode_tracklist` to explore podcast episodes and their tracklists, and `search_edm_news` for the latest aggregated EDM news.",
  tools: [
    getNowPlaying,
    getRecentTracks,
    listEpisodes,
    getEpisodeTracklist,
    searchNews,
  ],
});
