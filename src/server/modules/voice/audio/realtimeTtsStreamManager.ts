import {
  RealtimeTtsChunkBuffer,
  type TtsAudioChunk,
} from './realtimeTtsChunkBuffer.js';
import {
  RealtimeTtsPlaybackQueue,
  type TtsPlaybackItem,
} from './realtimeTtsPlaybackQueue.js';

export type RealtimeTtsStreamManagerOptions = {
  sessionId: string;
  streamId: string;
  maxBufferedChunks?: number;
};

export class RealtimeTtsStreamManager {
  private readonly buffer = new RealtimeTtsChunkBuffer();
  private readonly queue = new RealtimeTtsPlaybackQueue();
  private sequence = 0;

  constructor(private readonly options: RealtimeTtsStreamManagerOptions) {}

  appendProviderChunk(payloadBase64: string, text?: string): void {
    const nextSequence = this.sequence + 1;
    this.sequence = nextSequence;

    const chunk: TtsAudioChunk = {
      sessionId: this.options.sessionId,
      streamId: this.options.streamId,
      sequenceNumber: nextSequence,
      payloadBase64,
      encoding: 'mulaw',
      sampleRateHz: 8000,
      receivedAt: new Date(),
      ...(text ? { text } : {}),
    };

    this.buffer.append(chunk);

    if (
      this.options.maxBufferedChunks &&
      this.buffer.snapshot().chunkCount >= this.options.maxBufferedChunks
    ) {
      this.flushBufferedAudio();
    }
  }

  flushBufferedAudio(): TtsPlaybackItem | null {
    const payloadBase64 = this.buffer.flushPayloadBase64();
    if (!payloadBase64) return null;

    const item: TtsPlaybackItem = {
      id: `tts_${this.options.sessionId}_${this.sequence}`,
      sessionId: this.options.sessionId,
      streamId: this.options.streamId,
      sequenceNumber: this.sequence,
      payloadBase64,
      createdAt: new Date(),
    };

    this.queue.enqueue(item);
    return item;
  }

  nextPlaybackItem(): TtsPlaybackItem | null {
    return this.queue.dequeue();
  }

  interrupt(): TtsPlaybackItem[] {
    this.buffer.clear();
    return this.queue.interrupt();
  }

  queuedCount(): number {
    return this.queue.size();
  }
}

export function createRealtimeTtsStreamManager(
  options: RealtimeTtsStreamManagerOptions
): RealtimeTtsStreamManager {
  return new RealtimeTtsStreamManager(options);
}
