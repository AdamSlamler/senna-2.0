import type {
  IntegrationAdapter,
  IntegrationRequest,
  IntegrationResult,
} from '../integrationRegistry.js';

export type RestaurantCapability =
  | 'create_reservation'
  | 'join_waitlist'
  | 'answer_hours'
  | 'answer_menu_question'
  | 'create_catering_request';

export type RestaurantReservationProvider = IntegrationAdapter & {
  category: 'reservation' | 'pos';
  capabilities: RestaurantCapability[];
};

export function createUnsupportedRestaurantProvider(input: {
  provider: string;
  category: 'reservation' | 'pos';
}): RestaurantReservationProvider {
  return {
    provider: input.provider,
    category: input.category,
    verticals: ['restaurants'],
    capabilities: [
      'create_reservation',
      'join_waitlist',
      'answer_hours',
      'answer_menu_question',
      'create_catering_request',
    ],
    async execute(
      request: IntegrationRequest
    ): Promise<IntegrationResult> {
      return {
        ok: false,
        provider: input.provider,
        capability: request.capability,
        errorMessage: `${input.provider} adapter is not configured yet`,
        retryable: false,
      };
    },
  };
}
