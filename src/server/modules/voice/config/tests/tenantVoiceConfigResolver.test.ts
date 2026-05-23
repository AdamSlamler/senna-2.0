import { describe, expect, it } from 'vitest';
import { VoiceConfigError, resolveVoiceRuntimeConfig } from '../tenantVoiceConfigResolver.js';
import type {
  BusinessVoiceRecord,
  LocationVoiceRecord,
  TenantVoiceRecord,
} from '../businessVoiceConfigResolver.js';
import { createMemoryVoiceConfigRepository } from '../memoryVoiceConfigRepository.js';

const tenant: TenantVoiceRecord = {
  tenantId: 'tenant_enterprise',
  name: 'Enterprise Tenant',
  enabled: true,
  providers: {
    telephony: 'signalwire',
    stt: 'deepgram',
    llm: 'openai',
    tts: 'deepgram_voice',
  },
  runtimeLimits: {
    maxConcurrentTenantCalls: 1000,
  },
};

const business: BusinessVoiceRecord = {
  tenantId: 'tenant_enterprise',
  businessId: 'business_hq',
  name: 'Enterprise Home Services',
  phoneNumber: '+14805550100',
  enabled: true,
  defaultLocationId: 'location_default',
  isMultiLocation: false,
  featureFlags: {
    smsEnabled: true,
    bookingEnabled: true,
  },
  services: [{ id: 'svc_hvac', name: 'HVAC', enabled: true }],
  serviceAreas: [
    {
      id: 'area_phoenix',
      city: 'Phoenix',
      state: 'AZ',
      zipCodes: ['85001'],
      enabled: true,
    },
  ],
  pricingRules: [
    {
      id: 'price_hvac',
      serviceId: 'svc_hvac',
      label: 'HVAC diagnostic',
      basePriceCents: 9900,
      enabled: true,
    },
  ],
  faqs: [{ id: 'faq_1', question: 'Do you serve Phoenix?', answer: 'Yes.', enabled: true }],
  policies: [],
};

const location: LocationVoiceRecord = {
  tenantId: 'tenant_enterprise',
  businessId: 'business_hq',
  locationId: 'location_phoenix',
  name: 'Phoenix',
  phoneNumber: '+14805550101',
  cities: ['Phoenix'],
  zipCodes: ['85001'],
  enabled: true,
  runtimeLimits: {
    maxConcurrentLocationCalls: 50,
  },
  services: [{ id: 'svc_pool', name: 'Pool Cleaning', enabled: true }],
};

describe('resolveVoiceRuntimeConfig', () => {
  it('resolves enterprise provider defaults and business config by phone number', async () => {
    const config = await resolveVoiceRuntimeConfig({
      phoneNumber: '(480) 555-0100',
      repository: createMemoryVoiceConfigRepository({
        tenants: [tenant],
        businesses: [business],
      }),
    });

    expect(config).toMatchObject({
      tenantId: 'tenant_enterprise',
      businessId: 'business_hq',
      locationId: 'location_default',
      businessName: 'Enterprise Home Services',
      locationName: 'default',
      phoneNumber: '+14805550100',
      isMultiLocation: false,
      routing: {
        mode: 'single_location',
        defaultLocationId: 'location_default',
      },
      providers: {
        telephony: 'signalwire',
        stt: 'deepgram',
        llm: 'openai',
        tts: 'deepgram_voice',
      },
    });
    expect(config.runtimeLimits.maxConcurrentTenantCalls).toBe(1000);
    expect(config.featureFlags.smsEnabled).toBe(true);
  });

  it('supports multi-location overrides', async () => {
    const multiLocationBusiness = {
      ...business,
      isMultiLocation: true,
      defaultLocationId: 'location_default',
      routing: {
        routeByPhoneNumber: true,
        routeByZipCode: true,
        routeByCity: true,
      },
    };
    const config = await resolveVoiceRuntimeConfig({
      phoneNumber: '+14805550101',
      repository: createMemoryVoiceConfigRepository({
        tenants: [tenant],
        businesses: [multiLocationBusiness],
        locations: [location],
      }),
    });

    expect(config.locationId).toBe('location_phoenix');
    expect(config.locationName).toBe('Phoenix');
    expect(config.isMultiLocation).toBe(true);
    expect(config.routing.mode).toBe('multi_location');
    expect(config.phoneNumber).toBe('+14805550101');
    expect(config.services).toEqual(location.services);
    expect(config.runtimeLimits.maxConcurrentLocationCalls).toBe(50);
  });

  it('routes multi-location calls by zip code when phone number is shared', async () => {
    const config = await resolveVoiceRuntimeConfig({
      phoneNumber: '+14805550100',
      zipCode: '85001',
      repository: createMemoryVoiceConfigRepository({
        tenants: [tenant],
        businesses: [
          {
            ...business,
            isMultiLocation: true,
            defaultLocationId: 'location_default',
          },
        ],
        locations: [location],
      }),
    });

    expect(config.locationId).toBe('location_phoenix');
  });

  it('fails closed when no business matches the call', async () => {
    await expect(
      resolveVoiceRuntimeConfig({
        phoneNumber: '+15555550199',
        repository: createMemoryVoiceConfigRepository({
          tenants: [tenant],
          businesses: [business],
        }),
      })
    ).rejects.toMatchObject<Partial<VoiceConfigError>>({
      code: 'BUSINESS_NOT_FOUND',
    });
  });
});
