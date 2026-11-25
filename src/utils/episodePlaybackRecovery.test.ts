import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EpisodePlaybackRecovery, freshEpisodeUrl } from './episodePlaybackRecovery';

describe('episode playback recovery', () => {
  it('detects frozen media time after 12 seconds even if play fired', () => {
    const recovery = new EpisodePlaybackRecovery();
    recovery.start(1000, 0);
    assert.equal(recovery.observe(12000, 0), false);
    assert.equal(recovery.needsRecovery(12999), false);
    assert.equal(recovery.needsRecovery(13000), true);
  });
  it('advancing audio postpones recovery', () => {
    const recovery = new EpisodePlaybackRecovery();
    recovery.start(1000, 30);
    assert.equal(recovery.observe(12000, 31), true);
    assert.equal(recovery.needsRecovery(13000), false);
    assert.equal(recovery.needsRecovery(24000), true);
  });
  it('retries only once instead of leaving a permanent spinner or request loop', () => {
    const recovery = new EpisodePlaybackRecovery();
    recovery.start(1000, 432);
    assert.equal(recovery.retry(13000, 432), true);
    assert.equal(recovery.needsRecovery(24999), false);
    assert.equal(recovery.needsRecovery(25000), true);
    assert.equal(recovery.retry(25000, 432), false);
  });
  it('pause, close, and switching sources cancel recovery', () => {
    const recovery = new EpisodePlaybackRecovery();
    recovery.start(1000, 42);
    recovery.cancel();
    assert.equal(recovery.needsRecovery(99000), false);
    assert.equal(recovery.retry(99000, 42), false);
  });
  it('a new intentional resume gets a fresh retry budget', () => {
    const recovery = new EpisodePlaybackRecovery();
    recovery.start(1000, 42);
    recovery.retry(13000, 42);
    recovery.cancel();
    recovery.start(14000, 42);
    assert.equal(recovery.retry(26000, 42), true);
  });
  it('fresh downloads retain the official episode and tracking parameters', () => {
    const url = freshEpisodeUrl('https://media.blubrry.com/show/432.mp3?awEpisodeId=12318297&awCollectionId=673838&_cb=1', 999);
    const parsed = new URL(url);
    assert.equal(parsed.pathname, '/show/432.mp3');
    assert.equal(parsed.searchParams.get('awEpisodeId'), '12318297');
    assert.equal(parsed.searchParams.get('awCollectionId'), '673838');
    assert.deepEqual(parsed.searchParams.getAll('_cb'), ['999']);
  });
});