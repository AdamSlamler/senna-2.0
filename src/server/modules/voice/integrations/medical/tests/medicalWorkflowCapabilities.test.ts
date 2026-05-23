import { describe, expect, it } from 'vitest';
import { medicalWorkflowCapabilities } from '../medicalWorkflowCapabilities.js';

describe('medicalWorkflowCapabilities', () => {
  it('supports appointment, insurance, office hours, and location routing flows', () => {
    expect(medicalWorkflowCapabilities).toEqual([
      'create_appointment_request',
      'capture_insurance_intake',
      'answer_office_hours',
      'route_location',
    ]);
  });
});
