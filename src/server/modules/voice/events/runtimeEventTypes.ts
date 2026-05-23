export type VoiceRuntimeEventType =
  | 'voice.call.started'
  | 'voice.call.ended'
  | 'voice.session.started'
  | 'voice.session.recovered'
  | 'voice.audio.inbound'
  | 'voice.audio.outbound'
  | 'voice.transcript.partial'
  | 'voice.transcript.final'
  | 'voice.intent.detected'
  | 'voice.tool.requested'
  | 'voice.tool.completed'
  | 'voice.lead.captured'
  | 'voice.error';

export type VoiceRuntimeEventSeverity = 'debug' | 'info' | 'warn' | 'error';

export type VoiceRuntimeEventScope = {
  tenantId: string;
  businessId: string;
  locationId: string;
  callId?: string;
  sessionId?: string;
};

export type VoiceRuntimeEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  type: VoiceRuntimeEventType;
  severity: VoiceRuntimeEventSeverity;
  scope: VoiceRuntimeEventScope;
  payload: TPayload;
  occurredAt: Date;
};

export type VoiceRuntimeEventHandler<TPayload extends Record<string, unknown> = Record<string, unknown>> = (
  event: VoiceRuntimeEvent<TPayload>
) => void | Promise<void>;

export function createRuntimeEvent<TPayload extends Record<string, unknown>>(input: {
  type: VoiceRuntimeEventType;
  severity?: VoiceRuntimeEventSeverity;
  scope: VoiceRuntimeEventScope;
  payload?: TPayload;
  occurredAt?: Date;
}): VoiceRuntimeEvent<TPayload> {
  return {
    id: `event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type: input.type,
    severity: input.severity ?? 'info',
    scope: input.scope,
    payload: input.payload ?? ({} as TPayload),
    occurredAt: input.occurredAt ?? new Date(),
  };
}
