// Prefer HTTPS endpoints first so browsers and Electron do not waste time
// stalling on mixed-content or insecure stream URLs.
export const PRIMARY_STREAM_URLS = [
  "https://live-radio-stream.online/dance-one-radio.mp3",
  "https://s9.myradiostream.com:14296/;",
  "https://s9.myradiostream.com:14296/stream",
  "https://s9.myradiostream.com:14296",
  "http://s9.myradiostream.com:14296/;",
  "http://s9.myradiostream.com:14296/stream",
  "http://s9.myradiostream.com:14296",
] as const;
