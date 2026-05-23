import { describe, expect, it } from 'vitest';
import { openTableAdapter } from '../openTableAdapter.js';

describe('restaurant adapters', () => {
  it('declares restaurant reservation and service capabilities', () => {
    expect(openTableAdapter.verticals).toEqual(['restaurants']);
    expect(openTableAdapter.capabilities).toEqual([
      'create_reservation',
      'join_waitlist',
      'answer_hours',
      'answer_menu_question',
      'create_catering_request',
    ]);
  });
});
