export interface Wh0Session {
  number: number;
  title: string;
  /** Guest DJ name, when the episode features one */
  guest?: string;
  /** Fallback blurb used when there is no guest */
  blurb?: string;
  link: string;
  /** Station-local (Pacific) broadcast date/time */
  broadcastDate: string;
  genres: string;
}

export const WH0_SESSIONS: Wh0Session[] = [
  {
    number: 242,
    title: 'Wh0 Plays Sessions Episode 242 with Rue Jay',
    guest: 'Rue Jay',
    link: '/show/wh0-plays-sessions/242',
    broadcastDate: '2026-07-07T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 241,
    title: 'Wh0 Plays Sessions Episode 241',
    blurb: 'House • Tech House • Dance',
    link: '/show/wh0-plays-sessions/241',
    broadcastDate: '2026-08-07T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 240,
    title: 'Wh0 Plays Sessions Episode 240 with Johan S',
    guest: 'Johan S',
    link: '/show/wh0-plays-sessions/240',
    broadcastDate: '2026-07-31T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 239,
    title: 'Wh0 Plays Sessions Episode 239',
    blurb: 'House • Tech House • Dance',
    link: '/show/wh0-plays-sessions/239',
    broadcastDate: '2026-07-24T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 238,
    title: 'Wh0 Plays Sessions Episode 238',
    blurb: 'House • Tech House • Dance',
    link: '/show/wh0-plays-sessions/238',
    broadcastDate: '2026-07-14T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 236,
    title: 'Wh0 Plays Sessions Episode 236',
    blurb: 'House • Tech House • Dance',
    link: '/show/wh0-plays-sessions/236',
    broadcastDate: '2026-07-03T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 235,
    title: 'Wh0 Plays Sessions Episode 235 - Bad Intentions',
    guest: 'Bad Intentions',
    link: '/show/wh0-plays-sessions/235',
    broadcastDate: '2026-06-26T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 233,
    title: 'Wh0 Plays Sessions Episode 233 with Johan S',
    guest: 'Johan S',
    link: '/show/wh0-plays-sessions/233',
    broadcastDate: '2026-06-19T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 232,
    title: 'Wh0 Plays Sessions Episode 232 with Molly Mouse',
    guest: 'Molly Mouse',
    link: '/show/wh0-plays-sessions/232',
    broadcastDate: '2026-06-12T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 230,
    title: 'Wh0 Plays Sessions Episode 230',
    blurb: '14 tracks • Wh0, Rue Jay, Jewel Kid, Mercer, LEFTI & more',
    link: '/show/wh0-plays-sessions/230',
    broadcastDate: '2026-05-29T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 226,
    title: 'Wh0 Plays Sessions Episode 226',
    blurb: '15 tracks • Mark Knight, Wh0, Cristoph, CASSIMM & more',
    link: '/show/wh0-plays-sessions/226',
    broadcastDate: '2026-04-24T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 225,
    title: 'Wh0 Plays Sessions Episode 225',
    blurb: '14 tracks • Mark Knight, Wh0, Rue Jay, Joshwa & more',
    link: '/show/wh0-plays-sessions/225',
    broadcastDate: '2026-04-17T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 224,
    title: 'Wh0 Plays Sessions Episode 224',
    blurb: '15 tracks • Mark Knight, Wh0, Low Steppa & more',
    link: '/show/wh0-plays-sessions/224',
    broadcastDate: '2026-04-10T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 223,
    title: 'Wh0 Plays Sessions Episode 223 — Bad Intentions',
    blurb: '17 tracks • Mark Knight, Afrojack, LP Giobbi & more',
    link: '/show/wh0-plays-sessions/223',
    broadcastDate: '2026-04-03T18:00:00',
    genres: 'House • Tech House • Dance',
  },
  {
    number: 222,
    title: 'Wh0 Plays Sessions Episode 222 with Johan S',
    guest: 'Johan S',
    link: '/show/wh0-plays-sessions/222',
    broadcastDate: '2026-03-27T18:00:00',
    genres: 'House • Tech House • Dance',
  },
];
