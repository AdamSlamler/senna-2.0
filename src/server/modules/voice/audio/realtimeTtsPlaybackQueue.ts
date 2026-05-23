export type TtsPlaybackItem = {
  id: string;
  sessionId: string;
  streamId: string;
  payloadBase64: string;
  sequenceNumber: number;
  createdAt: Date;
};

export class RealtimeTtsPlaybackQueue {
  private readonly items: TtsPlaybackItem[] = [];
  private activeItemId: string | null = null;

  enqueue(item: TtsPlaybackItem): void {
    this.items.push(item);
    this.items.sort((left, right) => left.sequenceNumber - right.sequenceNumber);
  }

  dequeue(): TtsPlaybackItem | null {
    const next = this.items.shift() ?? null;
    this.activeItemId = next?.id ?? null;
    return next;
  }

  interrupt(): TtsPlaybackItem[] {
    const dropped = [...this.items];
    this.items.length = 0;
    this.activeItemId = null;
    return dropped;
  }

  markComplete(itemId: string): void {
    if (this.activeItemId === itemId) {
      this.activeItemId = null;
    }
  }

  size(): number {
    return this.items.length;
  }

  active(): string | null {
    return this.activeItemId;
  }
}

export function createRealtimeTtsPlaybackQueue(): RealtimeTtsPlaybackQueue {
  return new RealtimeTtsPlaybackQueue();
}
