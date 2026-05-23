export type VoiceAudioEncoding = 'mulaw' | 'linear16' | 'opus';

export type RawAudioChunk = {
  sessionId: string;
  streamId: string;
  sequenceNumber: number;
  payloadBase64: string;
  encoding: VoiceAudioEncoding;
  sampleRateHz: number;
  receivedAt: Date;
};

export type NormalizedAudioChunk = RawAudioChunk & {
  byteLength: number;
  durationMs: number;
};

export function normalizeAudioChunk(chunk: RawAudioChunk): NormalizedAudioChunk {
  const bytes = Buffer.from(chunk.payloadBase64, 'base64');

  return {
    ...chunk,
    byteLength: bytes.byteLength,
    durationMs: estimateAudioDurationMs({
      byteLength: bytes.byteLength,
      encoding: chunk.encoding,
      sampleRateHz: chunk.sampleRateHz,
    }),
  };
}

export function sortAudioChunks<T extends Pick<RawAudioChunk, 'sequenceNumber'>>(
  chunks: T[]
): T[] {
  return [...chunks].sort((left, right) => left.sequenceNumber - right.sequenceNumber);
}

export function concatenateAudioPayloads(
  chunks: Pick<RawAudioChunk, 'payloadBase64' | 'sequenceNumber'>[]
): string {
  const buffers = sortAudioChunks(chunks).map(chunk =>
    Buffer.from(chunk.payloadBase64, 'base64')
  );

  return Buffer.concat(buffers).toString('base64');
}

export function splitAudioPayload(input: {
  payloadBase64: string;
  maxBytes: number;
}): string[] {
  if (input.maxBytes <= 0) {
    throw new Error('maxBytes must be greater than zero');
  }

  const source = Buffer.from(input.payloadBase64, 'base64');
  const chunks: string[] = [];

  for (let offset = 0; offset < source.byteLength; offset += input.maxBytes) {
    chunks.push(source.subarray(offset, offset + input.maxBytes).toString('base64'));
  }

  return chunks;
}

function estimateAudioDurationMs(input: {
  byteLength: number;
  encoding: VoiceAudioEncoding;
  sampleRateHz: number;
}): number {
  if (input.sampleRateHz <= 0) return 0;

  if (input.encoding === 'linear16') {
    return Math.round((input.byteLength / 2 / input.sampleRateHz) * 1000);
  }

  if (input.encoding === 'mulaw') {
    return Math.round((input.byteLength / input.sampleRateHz) * 1000);
  }

  return 0;
}
