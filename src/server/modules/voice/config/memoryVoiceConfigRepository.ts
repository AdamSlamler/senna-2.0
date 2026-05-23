import type {
  BusinessVoiceRecord,
  LocationVoiceRecord,
  TenantVoiceRecord,
  VoiceConfigRepository,
} from './businessVoiceConfigResolver.js';
import { normalizePhoneNumber } from './tenantVoiceConfigResolver.js';

export function createMemoryVoiceConfigRepository(input?: {
  tenants?: TenantVoiceRecord[];
  businesses?: BusinessVoiceRecord[];
  locations?: LocationVoiceRecord[];
}): VoiceConfigRepository {
  const tenants = input?.tenants ?? [defaultTenant];
  const businesses = input?.businesses ?? [defaultBusiness];
  const locations = [
    ...(input?.locations ?? []),
    ...businesses
      .filter(
        business =>
          !(input?.locations ?? []).some(
            location =>
              location.tenantId === business.tenantId &&
              location.businessId === business.businessId &&
              location.locationId === business.defaultLocationId
          )
      )
      .map(createDefaultLocationForBusiness),
  ];

  return {
    async findTenant(tenantId) {
      return tenants.find(tenant => tenant.tenantId === tenantId) ?? null;
    },
    async findBusiness(query) {
      return (
        businesses.find(business => {
          if (query.tenantId && business.tenantId !== query.tenantId) return false;
          if (query.businessId && business.businessId !== query.businessId) return false;
          if (query.phoneNumber) {
            return normalizePhoneNumber(business.phoneNumber) === normalizePhoneNumber(query.phoneNumber);
          }
          return true;
        }) ?? null
      );
    },
    async findLocation(query) {
      const scopedLocations = locations.filter(
        location =>
          location.tenantId === query.tenantId &&
          location.businessId === query.businessId
      );

      if (query.locationId) {
        return (
          scopedLocations.find(location => location.locationId === query.locationId) ??
          null
        );
      }

      if (query.phoneNumber) {
        const byPhone = scopedLocations.find(
          location =>
            location.phoneNumber &&
            normalizePhoneNumber(location.phoneNumber) ===
              normalizePhoneNumber(query.phoneNumber!)
        );
        if (byPhone) return byPhone;
      }

      if (query.zipCode) {
        const byZipCode = scopedLocations.find(location =>
          location.zipCodes?.includes(query.zipCode!)
        );
        if (byZipCode) return byZipCode;
      }

      if (query.city) {
        const normalizedCity = normalizeText(query.city);
        const byCity = scopedLocations.find(location =>
          location.cities?.some(city => normalizeText(city) === normalizedCity)
        );
        if (byCity) return byCity;
      }

      const fallbackLocationId =
        query.fallbackLocationId ?? query.defaultLocationId;

      return (
        scopedLocations.find(
          location => location.locationId === fallbackLocationId
        ) ?? null
      );
    },
  };
}

function createDefaultLocationForBusiness(
  business: BusinessVoiceRecord
): LocationVoiceRecord {
  return {
    tenantId: business.tenantId,
    businessId: business.businessId,
    locationId: business.defaultLocationId,
    name: 'default',
    phoneNumber: business.phoneNumber,
    enabled: true,
    services: business.services,
    serviceAreas: business.serviceAreas,
    pricingRules: business.pricingRules,
    faqs: business.faqs,
    policies: business.policies,
    ...(business.brandId ? { brandId: business.brandId } : {}),
  };
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

const defaultTenant: TenantVoiceRecord = {
  tenantId: 'tenant_demo',
  name: 'Demo Tenant',
  enabled: true,
};

const defaultBusiness: BusinessVoiceRecord = {
  tenantId: 'tenant_demo',
  businessId: 'business_demo',
  name: 'Senna Demo Services',
  phoneNumber: '+14805550100',
  enabled: true,
  defaultLocationId: 'location_default',
  isMultiLocation: false,
  services: [
    {
      id: 'service_pool',
      name: 'Pool Cleaning',
      enabled: true,
    },
  ],
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
      id: 'price_pool',
      serviceId: 'service_pool',
      label: 'Pool Cleaning',
      basePriceCents: 12500,
      enabled: true,
    },
  ],
  faqs: [
    {
      id: 'faq_insured',
      question: 'Are you insured?',
      answer: 'Yes, our team is insured.',
      enabled: true,
    },
  ],
  policies: [],
};
