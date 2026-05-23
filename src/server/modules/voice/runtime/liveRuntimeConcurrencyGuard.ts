import type { VoiceRuntimeConfig } from '../config/providerVoiceConfigResolver.js';
import type { VoicePersistenceAdapter } from '../persistence/adapters/persistenceAdapter.js';

export class VoiceCapacityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VoiceCapacityError';
  }
}

export async function assertVoiceCapacity(input: {
  config: VoiceRuntimeConfig;
  persistence: VoicePersistenceAdapter;
}): Promise<void> {
  const { config, persistence } = input;

  const tenantCalls = await persistence.sessions.countActiveSessions({
    tenantId: config.tenantId,
  });
  if (tenantCalls >= config.runtimeLimits.maxConcurrentTenantCalls) {
    throw new VoiceCapacityError('Tenant concurrent call limit reached');
  }

  const businessCalls = await persistence.sessions.countActiveSessions({
    tenantId: config.tenantId,
    businessId: config.businessId,
  });
  if (businessCalls >= config.runtimeLimits.maxConcurrentBusinessCalls) {
    throw new VoiceCapacityError('Business concurrent call limit reached');
  }

  if (!config.locationId) return;

  const locationCalls = await persistence.sessions.countActiveSessions({
    tenantId: config.tenantId,
    businessId: config.businessId,
    locationId: config.locationId,
  });
  if (locationCalls >= config.runtimeLimits.maxConcurrentLocationCalls) {
    throw new VoiceCapacityError('Location concurrent call limit reached');
  }
}
