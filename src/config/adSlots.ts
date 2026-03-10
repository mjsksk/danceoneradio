/**
 * Centralized AdSense slot configuration.
 * When new ad units are created in AdSense, update slot IDs here only.
 */
export const AD_SLOTS = {
  /** Top of page / hero area — horizontal format */
  HEADER: '6777392184',
  /** Mid-content placement — auto format */
  IN_CONTENT: '6777392184',
  /** Between episode cards on Shows page — in-article fluid */
  BETWEEN_EPISODES: '6777392184',
  /** After tracklist on episode pages — rectangle */
  AFTER_TRACKLIST: '6777392184',
  /** News pages — auto format */
  NEWS: '6777392184',
  /** Merch / utility pages */
  SIDEBAR: '6777392184',
} as const;
