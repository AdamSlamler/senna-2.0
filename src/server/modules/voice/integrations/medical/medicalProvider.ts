import type { IntegrationAdapter } from '../integrationRegistry.js';

export type MedicalCapability =
  | 'create_appointment_request'
  | 'capture_insurance_intake'
  | 'answer_office_hours'
  | 'route_location';

export type MedicalProvider = IntegrationAdapter & {
  verticals: ['medical'];
  capabilities: MedicalCapability[];
};
