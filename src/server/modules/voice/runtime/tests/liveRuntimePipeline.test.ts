import { describe, expect, it } from 'vitest';
import { createMemoryVoiceConfigRepository } from '../../config/memoryVoiceConfigRepository.js';
import { createMemoryVoicePersistenceAdapter } from '../../persistence/adapters/memory/memoryPersistenceAdapter.js';
import {
  mockLlmProvider,
  mockSttProvider,
  mockTelephonyProvider,
  mockTtsProvider,
} from './mockRuntimeProviders.js';
import { createVoiceRuntime } from '../liveRuntimePipeline.js';

describe('createVoiceRuntime', () => {
  it('starts a SignalWire call and processes a media turn through STT, OpenAI, and Deepgram voice ports', async () => {
    const persistence = createMemoryVoicePersistenceAdapter();
    const runtime = createVoiceRuntime({
      configRepository: createMemoryVoiceConfigRepository(),
      persistence,
      providers: {
        telephony: mockTelephonyProvider,
        stt: mockSttProvider,
        llm: mockLlmProvider,
        tts: mockTtsProvider,
      },
      mediaStreamUrl: 'wss://voice.example.test/media',
    });

    const started = await runtime.startInboundCall({
      CallSid: 'CA123',
      From: '+16025550100',
      To: '+14805550100',
    });

    expect(started.connectResponse).toContain('wss://voice.example.test/media');

    await runtime.handleMediaStreamEvent({
      event: 'start',
      callSid: 'CA123',
      streamSid: 'MS123',
    });

    const media = await runtime.handleMediaStreamEvent({
      event: 'media',
      callSid: 'CA123',
      streamSid: 'MS123',
      payload: Buffer.from('What does pool cleaning cost?', 'utf8').toString('base64'),
    });

    expect(media).toMatchObject({
      transcript: 'What does pool cleaning cost?',
      responseText: 'I can help with pricing. What service and zip code should I check?',
    });
    expect(media?.audioBase64).toBeTruthy();
    await expect(persistence.conversations.listTurns(started.sessionId)).resolves.toHaveLength(2);
  });
});
