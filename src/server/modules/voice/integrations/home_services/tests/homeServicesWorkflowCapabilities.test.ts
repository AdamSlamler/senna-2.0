import { describe, expect, it } from 'vitest';
import { homeServicesWorkflowCapabilities } from '../homeServicesWorkflowCapabilities.js';

describe('homeServicesWorkflowCapabilities', () => {
  it('supports quote, service area, lead capture, and appointment request flows', () => {
    expect(homeServicesWorkflowCapabilities).toEqual([
      'create_quote',
      'check_service_area',
      'capture_lead',
      'create_appointment_request',
    ]);
  });
});
