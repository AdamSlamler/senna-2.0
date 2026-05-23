import type { VoiceRuntimeConfig } from '../config/providerVoiceConfigResolver.js';

export type {
  VoiceProviderConfig,
  VoiceProviderName,
} from '../config/providerVoiceConfigResolver.js';

export type TelephonyInboundCall = {
  providerCallId: string;
  fromNumber?: string;
  toNumber: string;
  raw: Record<string, unknown>;
};

export type MediaStreamEvent = {
  providerCallId?: string;
  streamId: string;
  event: 'start' | 'media' | 'stop' | 'mark';
  payload?: string;
  raw: Record<string, unknown>;
};

export type SttTranscript = {
  text: string;
  isFinal: boolean;
  confidence?: number;
};

export type LlmResponse = {
  text: string;
  intent: 'pricing' | 'booking' | 'lead' | 'support' | 'emergency' | 'general';
  toolRequests: Array<{
    toolName: string;
    payload: Record<string, unknown>;
  }>;
};

export type TtsAudioChunk = {
  audioBase64: string;
  format: 'mulaw' | 'mp3' | 'wav' | 'pcm';
};

export type TelephonyProvider = {
  parseInboundCall(raw: Record<string, unknown>): TelephonyInboundCall;
  parseMediaStreamEvent(raw: Record<string, unknown>): MediaStreamEvent;
  buildConnectMediaStreamResponse(input: {
    call: TelephonyInboundCall;
    streamUrl: string;
  }): string;
};

export type SttProvider = {
  transcribeAudio(input: {
    config: VoiceRuntimeConfig;
    audioBase64: string;
  }): Promise<SttTranscript | null>;
};

export type LlmProvider = {
  generateResponse(input: {
    config: VoiceRuntimeConfig;
    sessionId: string;
    transcript: string;
  }): Promise<LlmResponse>;
};

export type TtsProvider = {
  synthesize(input: {
    config: VoiceRuntimeConfig;
    text: string;
  }): Promise<TtsAudioChunk>;
};

export type VoiceProviderRegistry = {
  telephony: TelephonyProvider;
  stt: SttProvider;
  llm: LlmProvider;
  tts: TtsProvider;
};
