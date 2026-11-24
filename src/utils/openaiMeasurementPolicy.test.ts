import { describe, it as test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LiveStreamStartIntent, googleCmpMeasurementDecision, OPENAI_MEASUREMENT_NOTICE_VERSION,
  permitsOpenAIMeasurement, pixelDebugEnabled,
} from './openaiMeasurementPolicy';

describe('live_stream_started intent rules', () => {
  test('an intentional live start is consumed exactly once after playing', () => {
    const intent = new LiveStreamStartIntent();
    intent.arm();
    assert.equal(intent.consume('live'), true);
    assert.equal(intent.consume('live'), false);
  });
  test('another intentional resume counts as a new live start', () => {
    const intent = new LiveStreamStartIntent();
    intent.arm();
    intent.consume('live');
    intent.arm();
    assert.equal(intent.consume('live'), true);
  });
  test('podcasts never consume a live conversion', () => {
    const intent = new LiveStreamStartIntent();
    intent.arm();
    assert.equal(intent.consume('episode'), false);
    assert.equal(intent.consume('live'), false);
  });
  test('buffering playing events and unarmed reconnects do not count', () => {
    const intent = new LiveStreamStartIntent();
    assert.equal(intent.consume('live'), false);
    intent.arm();
    intent.consume('live');
    assert.equal(intent.consume('live'), false);
  });
  test('pause, close, and automatic restart cancel an unfinished start', () => {
    const intent = new LiveStreamStartIntent();
    intent.arm();
    intent.cancel();
    assert.equal(intent.consume('live'), false);
  });
  test('a consumed blocked start is not replayed on a later playing event', () => {
    const intent = new LiveStreamStartIntent();
    intent.arm();
    assert.equal(intent.consume('live'), true);
    assert.equal(intent.consume('live'), false);
  });
});

describe('measurement consent and environment', () => {
  const accepted = { advertising: true, measurementNoticeVersion: OPENAI_MEASUREMENT_NOTICE_VERSION };
  test('advertising acceptance of the measurement notice allows measurement', () => {
    assert.equal(permitsOpenAIMeasurement(accepted, false), true);
  });
  test('missing consent, analytics-only consent, or withdrawal blocks measurement', () => {
    assert.equal(permitsOpenAIMeasurement(null, false), false);
    assert.equal(permitsOpenAIMeasurement({ ...accepted, advertising: false }, false), false);
  });
  test('legacy consent does not silently grant consent for a new recipient', () => {
    assert.equal(permitsOpenAIMeasurement({ advertising: true }, false), false);
  });
  test('Global Privacy Control overrides acceptance', () => {
    assert.equal(permitsOpenAIMeasurement(accepted, true), false);
  });
  test('debug is on in preview and off on production domains', () => {
    assert.equal(pixelDebugEnabled(true, 'localhost'), true);
    assert.equal(pixelDebugEnabled(false, 'id-preview--8bc93317.lovable.app'), true);
    assert.equal(pixelDebugEnabled(false, 'danceoneradio.com'), false);
    assert.equal(pixelDebugEnabled(false, 'danceoneradio.lovable.app'), false);
  });
});

describe('Google consent tool outside and inside GDPR regions', () => {
  test('gdprApplies false with no event status does not block measurement', () => {
    assert.equal(googleCmpMeasurementDecision({ gdprApplies: false, eventStatus: null }), true);
    assert.equal(googleCmpMeasurementDecision({ gdprApplies: false }), true);
  });
  test('GDPR visitors need both storage and measurement purposes', () => {
    const granted = { gdprApplies: true, eventStatus: 'useractioncomplete', purpose: { consents: { 1: true, 7: true } } };
    assert.equal(googleCmpMeasurementDecision(granted), true);
    assert.equal(googleCmpMeasurementDecision({ ...granted, purpose: { consents: { 1: true, 7: false } } }), false);
    assert.equal(googleCmpMeasurementDecision({ gdprApplies: true, eventStatus: 'tcloaded' }), false);
  });
  test('GDPR visitors stay undecided while the dialog is still open', () => {
    assert.equal(googleCmpMeasurementDecision({ gdprApplies: true, eventStatus: 'cmpuishown' }), undefined);
  });
});
