import { describe, expect, it } from 'vitest';
import {
  createIntegrationRegistry,
  type IntegrationAdapter,
} from '../integrationRegistry.js';
import { routeIntegrationRequest } from '../integrationRouter.js';

const testAdapter: IntegrationAdapter = {
  provider: 'test_crm',
  category: 'crm',
  verticals: ['home_services'],
  capabilities: ['capture_lead'],
  async execute(request) {
    return {
      ok: true,
      provider: 'test_crm',
      capability: request.capability,
      data: {
        leadId: 'lead_1',
        locationId: request.context.locationId,
      },
    };
  },
};

describe('routeIntegrationRequest', () => {
  it('routes by provider, vertical, category, and capability', async () => {
    const registry = createIntegrationRegistry([testAdapter]);

    await expect(
      routeIntegrationRequest({
        registry,
        provider: 'test_crm',
        category: 'crm',
        vertical: 'home_services',
        request: {
          context: {
            tenantId: 'tenant_1',
            businessId: 'business_1',
            locationId: 'location_1',
          },
          capability: 'capture_lead',
          payload: {
            name: 'Taylor',
          },
        },
      })
    ).resolves.toMatchObject({
      ok: true,
      provider: 'test_crm',
      capability: 'capture_lead',
      data: {
        locationId: 'location_1',
      },
    });
  });

  it('fails closed when no adapter supports the capability', async () => {
    const registry = createIntegrationRegistry([]);

    await expect(
      routeIntegrationRequest({
        registry,
        vertical: 'restaurants',
        request: {
          context: {
            tenantId: 'tenant_1',
            businessId: 'business_1',
            locationId: 'location_1',
          },
          capability: 'create_reservation',
          payload: {},
        },
      })
    ).rejects.toThrow('No integration adapter found');
  });
});
