import { Router } from 'express';
import { createMemoryVoiceConfigRepository } from '../config/memoryVoiceConfigRepository.js';
import { createMemoryVoicePersistenceAdapter } from '../persistence/adapters/memory/memoryPersistenceAdapter.js';
import type {
  LlmProvider,
  SttProvider,
  TelephonyProvider,
  TtsProvider,
} from '../providers/providerConfig.js';
import { createVoiceRuntime } from '../runtime/liveRuntimePipeline.js';

export function createVoiceRouter(): Router {
  const router = Router();
  const runtime = createVoiceRuntime({
    configRepository: createMemoryVoiceConfigRepository(),
    persistence: createMemoryVoicePersistenceAdapter(),
    providers: {
      telephony: mockTelephonyProvider,
      stt: mockSttProvider,
      llm: mockLlmProvider,
      tts: mockTtsProvider,
    },
    mediaStreamUrl: process.env.SENNA_MEDIA_STREAM_URL ?? 'wss://example.com/voice/media',
  });

  router.post('/signalwire/webhook', async (req, res, next) => {
    try {
      const result = await runtime.startInboundCall(req.body);
      res.type('text/xml').send(result.connectResponse);
    } catch (error) {
      next(error);
    }
  });

  router.post('/signalwire/media', async (req, res, next) => {
    try {
      const result = await runtime.handleMediaStreamEvent(req.body);
      res.json({ ok: true, result });
    } catch (error) {
      next(error);
    }
  });

  router.post('/signalwire/status', (_req, res) => {
    res.json({ ok: true });
  });

  router.post('/signalwire/recording-status', (_req, res) => {
    res.json({ ok: true });
  });

  return router;
}

const mockTelephonyProvider: TelephonyProvider = {
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

const mockSttProvider: SttProvider = {
  async transcribeAudio({ audioBase64 }) {
    if (!audioBase64) return null;
    return {
      text: Buffer.from(audioBase64, 'base64').toString('utf8'),
      isFinal: true,
      confidence: 1,
    };
  },
};

const mockLlmProvider: LlmProvider = {
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

const mockTtsProvider: TtsProvider = {
  async synthesize({ text }) {
    return {
      audioBase64: Buffer.from(text, 'utf8').toString('base64'),
      format: 'mulaw',
    };
  },
};
