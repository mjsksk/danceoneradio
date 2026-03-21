// Use verified stream endpoints first. The `listen.mp3` URL stays on HTTPS,
// returns CORS headers, and has been the most compatible source for desktop builds.
export const PRIMARY_STREAM_URLS = [
  "https://s9.myradiostream.com/:14296/listen.mp3",
  "http://s9.myradiostream.com:14296/stream",
  "http://s9.myradiostream.com:14296/;",
  "http://s9.myradiostream.com:14296",
] as const;
