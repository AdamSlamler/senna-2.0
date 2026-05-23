export type AssistantSpeechStatus = 'idle' | 'speaking' | 'interrupted';

export type AssistantSpeechSnapshot = {
  sessionId: string;
  status: AssistantSpeechStatus;
  utteranceId?: string;
  startedAt?: Date;
  stoppedAt?: Date;
  interruptedAt?: Date;
};

export class RealtimeAssistantSpeechState {
  private snapshotValue: AssistantSpeechSnapshot;

  constructor(sessionId: string) {
    this.snapshotValue = {
      sessionId,
      status: 'idle',
    };
  }

  startSpeaking(utteranceId: string, now = new Date()): AssistantSpeechSnapshot {
    this.snapshotValue = {
      sessionId: this.snapshotValue.sessionId,
      status: 'speaking',
      utteranceId,
      startedAt: now,
    };
    return this.snapshot();
  }

  stopSpeaking(now = new Date()): AssistantSpeechSnapshot {
    this.snapshotValue = {
      sessionId: this.snapshotValue.sessionId,
      status: 'idle',
      stoppedAt: now,
    };
    return this.snapshot();
  }

  interrupt(now = new Date()): AssistantSpeechSnapshot {
    this.snapshotValue = {
      ...this.snapshotValue,
      status: 'interrupted',
      interruptedAt: now,
    };
    return this.snapshot();
  }

  isSpeaking(): boolean {
    return this.snapshotValue.status === 'speaking';
  }

  snapshot(): AssistantSpeechSnapshot {
    return { ...this.snapshotValue };
  }
}

export function createRealtimeAssistantSpeechState(
  sessionId: string
): RealtimeAssistantSpeechState {
  return new RealtimeAssistantSpeechState(sessionId);
}
