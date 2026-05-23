import { describe, expect, it } from 'vitest';
import {
  concatenateAudioPayloads,
  normalizeAudioChunk,
  splitAudioPayload,
} from '../audioChunkProcessor.js';

describe('audioChunkProcessor', () => {
  it('normalizes mulaw chunks with duration metadata', () => {
    const payloadBase64 = Buffer.alloc(800).toString('base64');

    const chunk = normalizeAudioChunk({
      sessionId: 'session_1',
      streamId: 'stream_1',
      sequenceNumber: 1,
      payloadBase64,
      encoding: 'mulaw',
      sampleRateHz: 8000,
      receivedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(chunk.byteLength).toBe(800);
    expect(chunk.durationMs).toBe(100);
  });

  it('concatenates payloads in sequence order', () => {
    const first = Buffer.from('first');
    const second = Buffer.from('second');

    const payload = concatenateAudioPayloads([
      { sequenceNumber: 2, payloadBase64: second.toString('base64') },
      { sequenceNumber: 1, payloadBase64: first.toString('base64') },
    ]);

    expect(Buffer.from(payload, 'base64').toString()).toBe('firstsecond');
  });

  it('splits payloads into byte-limited chunks', () => {
    const payload = Buffer.from('abcdef').toString('base64');

    const chunks = splitAudioPayload({ payloadBase64: payload, maxBytes: 2 });

    expect(chunks.map(chunk => Buffer.from(chunk, 'base64').toString())).toEqual([
      'ab',
      'cd',
      'ef',
    ]);
  });
});
