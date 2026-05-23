import { describe, expect, it } from 'vitest';
import { createRealtimeTtsStreamManager } from '../realtimeTtsStreamManager.js';

describe('RealtimeTtsStreamManager', () => {
  it('buffers provider chunks and exposes playback items', () => {
    const manager = createRealtimeTtsStreamManager({
      sessionId: 'session_1',
      streamId: 'stream_1',
      maxBufferedChunks: 2,
    });

    manager.appendProviderChunk(Buffer.from('hello ').toString('base64'));
    expect(manager.queuedCount()).toBe(0);

    manager.appendProviderChunk(Buffer.from('world').toString('base64'));
    expect(manager.queuedCount()).toBe(1);

    const item = manager.nextPlaybackItem();
    expect(item?.sessionId).toBe('session_1');
    expect(Buffer.from(item?.payloadBase64 ?? '', 'base64').toString()).toBe(
      'hello world'
    );
  });

  it('clears buffered and queued audio on interruption', () => {
    const manager = createRealtimeTtsStreamManager({
      sessionId: 'session_1',
      streamId: 'stream_1',
      maxBufferedChunks: 1,
    });

    manager.appendProviderChunk(Buffer.from('drop me').toString('base64'));

    const dropped = manager.interrupt();

    expect(dropped).toHaveLength(1);
    expect(manager.queuedCount()).toBe(0);
  });
});
