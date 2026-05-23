import { concatenateAudioPayloads, type RawAudioChunk } from './audioChunkProcessor.js';

export type TtsAudioChunk = RawAudioChunk & {
  text?: string;
  isFinal?: boolean;
};

export type TtsChunkBufferSnapshot = {
  chunkCount: number;
  byteLength: number;
  durationMs: number;
};

export class RealtimeTtsChunkBuffer {
  private readonly chunks: TtsAudioChunk[] = [];

  append(chunk: TtsAudioChunk): TtsChunkBufferSnapshot {
    this.chunks.push(chunk);
    return this.snapshot();
  }

  flush(): TtsAudioChunk[] {
    const flushed = [...this.chunks].sort(
      (left, right) => left.sequenceNumber - right.sequenceNumber
    );
    this.chunks.length = 0;
    return flushed;
  }

  flushPayloadBase64(): string {
    return concatenateAudioPayloads(this.flush());
  }

  clear(): void {
    this.chunks.length = 0;
  }

  snapshot(): TtsChunkBufferSnapshot {
    return this.chunks.reduce<TtsChunkBufferSnapshot>(
      (snapshot, chunk) => ({
        chunkCount: snapshot.chunkCount + 1,
        byteLength:
          snapshot.byteLength + Buffer.from(chunk.payloadBase64, 'base64').byteLength,
        durationMs: snapshot.durationMs,
      }),
      { chunkCount: 0, byteLength: 0, durationMs: 0 }
    );
  }
}

export function createRealtimeTtsChunkBuffer(): RealtimeTtsChunkBuffer {
  return new RealtimeTtsChunkBuffer();
}
