import type {
  LlmProvider,
  SttProvider,
  TelephonyProvider,
  TtsProvider,
} from '../../providers/providerConfig.js';

export const mockTelephonyProvider: TelephonyProvider = {
  parseInboundCall(raw) {
    return {
      providerCallId: String(raw.CallSid ?? raw.callSid ?? 'mock-call'),
      toNumber: String(raw.To ?? raw.to ?? ''),
      raw,
      ...(raw.From ? { fromNumber: String(raw.From) } : {}),
    };
  },
  parseMediaStreamEvent(raw) {
    return {
      streamId: String(raw.streamSid ?? raw.streamId ?? 'mock-stream'),
      event: String(raw.event ?? 'media') as 'start' | 'media' | 'stop' | 'mark',
      raw,
      ...(raw.callSid ? { providerCallId: String(raw.callSid) } : {}),
      ...(raw.payload ? { payload: String(raw.payload) } : {}),
    };
  },
  buildConnectMediaStreamResponse({ streamUrl }) {
    return `<Response><Connect><Stream url="${streamUrl}" /></Connect></Response>`;
  },
};

export const mockSttProvider: SttProvider = {
  async transcribeAudio({ audioBase64 }) {
    if (!audioBase64) return null;
    return {
      text: Buffer.from(audioBase64, 'base64').toString('utf8'),
      isFinal: true,
      confidence: 1,
    };
  },
};

export const mockLlmProvider: LlmProvider = {
  async generateResponse({ transcript }) {
    const text = transcript.toLowerCase();
    if (text.includes('price') || text.includes('cost')) {
      return {
        text: 'I can help with pricing. What service and zip code should I check?',
        intent: 'pricing',
        toolRequests: [{ toolName: 'lookup_pricing', payload: { transcript } }],
      };
    }

    return {
      text: 'I can help with that. Can I get a few details?',
      intent: 'general',
      toolRequests: [],
    };
  },
};

export const mockTtsProvider: TtsProvider = {
  async synthesize({ text }) {
    return {
      audioBase64: Buffer.from(text, 'utf8').toString('base64'),
      format: 'mulaw',
    };
  },
};
