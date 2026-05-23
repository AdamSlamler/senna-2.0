import type { IntegrationAdapter } from '../integrationRegistry.js';

export type SalonCapability =
  | 'book_appointment'
  | 'select_stylist'
  | 'answer_service_pricing';

export type SalonProvider = IntegrationAdapter & {
  verticals: ['salons'];
  capabilities: SalonCapability[];
};
