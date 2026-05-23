import { resolveVoiceRuntimeConfig } from '../config/tenantVoiceConfigResolver.js';
import type { VoiceConfigRepository } from '../config/businessVoiceConfigResolver.js';
import { assertVoiceCapacity } from './liveRuntimeConcurrencyGuard.js';
import type { VoicePersistenceAdapter } from '../persistence/adapters/persistenceAdapter.js';
import type {
  MediaStreamEvent,
  TelephonyInboundCall,
  VoiceProviderRegistry,
} from '../providers/providerConfig.js';

export type VoiceRuntime = {
  startInboundCall(raw: Record<string, unknown>): Promise<{
    sessionId: string;
    callId: string;
    connectResponse: string;
  }>;
  handleMediaStreamEvent(raw: Record<string, unknown>): Promise<{
    sessionId: string;
    transcript?: string;
    responseText?: string;
    audioBase64?: string;
  } | null>;
};

export function createVoiceRuntime(input: {
  configRepository: VoiceConfigRepository;
  persistence: VoicePersistenceAdapter;
  providers: VoiceProviderRegistry;
  mediaStreamUrl: string;
}): VoiceRuntime {
  const { configRepository, persistence, providers, mediaStreamUrl } = input;

  return {
    async startInboundCall(raw) {
      const inboundCall = providers.telephony.parseInboundCall(raw);
      const config = await resolveVoiceRuntimeConfig({
        phoneNumber: inboundCall.toNumber,
        repository: configRepository,
      });
      await assertVoiceCapacity({ config, persistence });
      const call = await persistence.calls.createCall({
        tenantId: config.tenantId,
        businessId: config.businessId,
        locationId: config.locationId,
        providerCallId: inboundCall.providerCallId,
        toNumber: inboundCall.toNumber,
        status: 'in_progress',
        startedAt: new Date(),
        ...(inboundCall.fromNumber ? { fromNumber: inboundCall.fromNumber } : {}),
      });
      const session = await persistence.sessions.createSession({
        callId: call.id,
        tenantId: config.tenantId,
        businessId: config.businessId,
        locationId: config.locationId,
        providerCallId: inboundCall.providerCallId,
        status: 'starting',
        config,
      });

      await persistence.events.recordRuntimeEvent({
        tenantId: config.tenantId,
        businessId: config.businessId,
        locationId: config.locationId,
        callId: call.id,
        sessionId: session.id,
        severity: 'info',
        type: 'voice.call_started',
        message: 'Inbound call session created',
        metadata: { providerCallId: inboundCall.providerCallId },
      });

      return {
        sessionId: session.id,
        callId: call.id,
        connectResponse: providers.telephony.buildConnectMediaStreamResponse({
          call: inboundCall,
          streamUrl: mediaStreamUrl,
        }),
      };
    },

    async handleMediaStreamEvent(raw) {
      const event = providers.telephony.parseMediaStreamEvent(raw);
      const session = await resolveSessionForMediaEvent(persistence, event);
      if (!session) return null;

      if (event.event === 'start') {
        await persistence.sessions.updateSession({
          ...session,
          streamId: event.streamId,
          status: 'active',
        });
        return { sessionId: session.id };
      }

      if (event.event === 'stop') {
        await persistence.sessions.updateSession({
          ...session,
          status: 'ended',
        });
        return { sessionId: session.id };
      }

      if (!event.payload) return { sessionId: session.id };

      const transcript = await providers.stt.transcribeAudio({
        config: session.config,
        audioBase64: event.payload,
      });
      if (!transcript) return { sessionId: session.id };

      await persistence.transcripts.appendSegment({
        sessionId: session.id,
        callId: session.callId,
        speaker: 'caller',
        text: transcript.text,
        isFinal: transcript.isFinal,
        ...(transcript.confidence !== undefined
          ? { confidence: transcript.confidence }
          : {}),
      });
      await persistence.conversations.appendTurn({
        sessionId: session.id,
        callId: session.callId,
        role: 'caller',
        content: transcript.text,
      });

      const llmResponse = await providers.llm.generateResponse({
        config: session.config,
        sessionId: session.id,
        transcript: transcript.text,
      });

      for (const request of llmResponse.toolRequests) {
        await persistence.toolExecutions.createToolExecution({
          sessionId: session.id,
          callId: session.callId,
          toolName: request.toolName,
          status: 'pending',
          request: request.payload,
        });
      }

      await persistence.conversations.appendTurn({
        sessionId: session.id,
        callId: session.callId,
        role: 'assistant',
        content: llmResponse.text,
      });

      const audio = await providers.tts.synthesize({
        config: session.config,
        text: llmResponse.text,
      });

      return {
        sessionId: session.id,
        transcript: transcript.text,
        responseText: llmResponse.text,
        audioBase64: audio.audioBase64,
      };
    },
  };
}

async function resolveSessionForMediaEvent(
  persistence: VoicePersistenceAdapter,
  event: MediaStreamEvent
) {
  if (event.providerCallId) {
    const byCall = await persistence.sessions.findSessionByProviderCallId(event.providerCallId);
    if (byCall) return byCall;
  }

  return persistence.sessions.findSessionByStreamId(event.streamId);
}

export function parseSignalWireFormBody(body: Record<string, unknown>): TelephonyInboundCall {
  return {
    providerCallId: String(body.CallSid ?? body.callSid ?? ''),
    toNumber: String(body.To ?? body.to ?? ''),
    raw: body,
    ...(body.From ? { fromNumber: String(body.From) } : {}),
  };
}
