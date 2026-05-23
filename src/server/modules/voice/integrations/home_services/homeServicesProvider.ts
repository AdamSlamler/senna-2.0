import type { IntegrationAdapter } from '../integrationRegistry.js';

export type HomeServicesCapability =
  | 'create_quote'
  | 'check_service_area'
  | 'capture_lead'
  | 'create_appointment_request';

export type HomeServicesProvider = IntegrationAdapter & {
  verticals: ['home_services'];
  capabilities: HomeServicesCapability[];
};
