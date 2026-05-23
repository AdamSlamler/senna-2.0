import { describe, expect, it } from 'vitest';
import { salonWorkflowCapabilities } from '../salonWorkflowCapabilities.js';

describe('salonWorkflowCapabilities', () => {
  it('supports booking, stylist selection, and service pricing flows', () => {
    expect(salonWorkflowCapabilities).toEqual([
      'book_appointment',
      'select_stylist',
      'answer_service_pricing',
    ]);
  });
});
