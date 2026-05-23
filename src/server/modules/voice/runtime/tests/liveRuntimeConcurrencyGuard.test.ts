import { describe, expect, it } from 'vitest';
import { assertVoiceCapacity, VoiceCapacityError } from '../liveRuntimeConcurrencyGuard.js';
import { createMemoryVoicePersistenceAdapter } from '../../persistence/adapters/memory/memoryPersistenceAdapter.js';
import type { VoiceRuntimeConfig } from '../../config/providerVoiceConfigResolver.js';

function config(overrides: Partial<VoiceRuntimeConfig> = {}): VoiceRuntimeConfig {
  return {
    tenantId: 'tenant_1',
    businessId: 'business_1',
    locationId: 'location_default',
    businessName: 'Business',
    locationName: 'default',
    phoneNumber: '+14805550100',
    isMultiLocation: false,
    routing: {
      mode: 'single_location',
      defaultLocationId: 'location_default',
      routeByPhoneNumber: true,
      routeByZipCode: false,
      routeByCity: false,
    },
    providers: {
      telephony: 'signalwire',
      stt: 'deepgram',
      llm: 'openai',
      tts: 'deepgram_voice',
    },
    featureFlags: {
      smsEnabled: false,
      bookingEnabled: false,
      recordingEnabled: false,
      emergencyRoutingEnabled: true,
      humanTransferEnabled: false,
    },
    runtimeLimits: {
      maxCallDurationSeconds: 900,
      maxTranscriptCharacters: 80_000,
      maxToolExecutionsPerCall: 20,
      maxRealtimeReconnects: 3,
      maxConcurrentTenantCalls: 1,
      maxConcurrentBusinessCalls: 1,
      maxConcurrentLocationCalls: 1,
      maxCallStartsPerMinute: 120,
    },
    services: [],
    serviceAreas: [],
    pricingRules: [],
    faqs: [],
    policies: [],
    emergencyRouting: { enabled: true },
    afterHoursBehavior: { mode: 'answer' },
    ...overrides,
  };
}

describe('assertVoiceCapacity', () => {
  it('allows a call when scoped capacity is available', async () => {
    await expect(
      assertVoiceCapacity({
        config: config(),
        persistence: createMemoryVoicePersistenceAdapter(),
      })
    ).resolves.toBeUndefined();
  });

  it('rejects new calls when tenant capacity is reached', async () => {
    const persistence = createMemoryVoicePersistenceAdapter();
    const runtimeConfig = config();
    await persistence.sessions.createSession({
      callId: 'call_1',
      tenantId: runtimeConfig.tenantId,
      businessId: runtimeConfig.businessId,
      locationId: runtimeConfig.locationId,
      status: 'active',
      config: runtimeConfig,
    });

    await expect(
      assertVoiceCapacity({ config: runtimeConfig, persistence })
    ).rejects.toBeInstanceOf(VoiceCapacityError);
  });
});
