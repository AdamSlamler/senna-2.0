import type {
  IntegrationAdapter,
  IntegrationRequest,
  IntegrationResult,
} from '../integrationRegistry.js';

export type CrmCapability =
  | 'create_lead'
  | 'update_lead'
  | 'create_customer'
  | 'create_appointment_request'
  | 'sync_conversation_summary';

export type CrmProvider = IntegrationAdapter & {
  category: 'crm';
  capabilities: CrmCapability[];
};

export function createUnsupportedCrmProvider(provider: string): CrmProvider {
  return {
    provider,
    category: 'crm',
    verticals: ['home_services', 'medical', 'salons'],
    capabilities: [
      'create_lead',
      'update_lead',
      'create_customer',
      'create_appointment_request',
      'sync_conversation_summary',
    ],
    async execute(
      request: IntegrationRequest
    ): Promise<IntegrationResult> {
      return {
        ok: false,
        provider,
        capability: request.capability,
        errorMessage: `${provider} adapter is not configured yet`,
        retryable: false,
      };
    },
  };
}
