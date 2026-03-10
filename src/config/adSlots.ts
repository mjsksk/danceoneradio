/**
 * Centralized AdSense slot configuration.
 * When new ad units are created in AdSense, update slot IDs here only.
 */
export const AD_SLOTS = {
  /** Top of page / hero area — horizontal format */
  HEADER: '4566264376',
  /** Mid-content placement — auto format */
  IN_CONTENT: '1288888987',
  /** Between episode cards on Shows page — in-article fluid */
  BETWEEN_EPISODES: '6426140950',
  /** After tracklist on episode pages — rectangle */
  AFTER_TRACKLIST: '3799977616',
  /** News pages — auto format */
  NEWS: '2486895948',
  /** Merch / utility pages */
  SIDEBAR: '1173814275',
} as const;
