import {
  defaultFeatureFlags,
  defaultProviders,
  defaultRuntimeLimits,
  type VoiceRuntimeConfig,
} from './providerVoiceConfigResolver.js';
import type { VoiceConfigRepository } from './businessVoiceConfigResolver.js';

export class VoiceConfigError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'TENANT_NOT_FOUND'
      | 'BUSINESS_NOT_FOUND'
      | 'LOCATION_NOT_FOUND'
      | 'DISABLED'
  ) {
    super(message);
    this.name = 'VoiceConfigError';
  }
}

export function normalizePhoneNumber(phoneNumber: string): string {
  const trimmed = phoneNumber.trim();
  if (trimmed.startsWith('+')) return trimmed;

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return trimmed;
}

export async function resolveVoiceRuntimeConfig(input: {
  tenantId?: string;
  businessId?: string;
  locationId?: string;
  phoneNumber?: string;
  city?: string;
  zipCode?: string;
  repository: VoiceConfigRepository;
}): Promise<VoiceRuntimeConfig> {
  const phoneNumber = input.phoneNumber
    ? normalizePhoneNumber(input.phoneNumber)
    : undefined;
  const business = await input.repository.findBusiness({
    ...(input.tenantId ? { tenantId: input.tenantId } : {}),
    ...(input.businessId ? { businessId: input.businessId } : {}),
    ...(phoneNumber ? { phoneNumber } : {}),
  });

  if (!business) {
    throw new VoiceConfigError('No voice business matched this call', 'BUSINESS_NOT_FOUND');
  }
  if (!business.enabled) {
    throw new VoiceConfigError('Voice is disabled for this business', 'DISABLED');
  }

  const tenant = await input.repository.findTenant(business.tenantId);
  if (!tenant) {
    throw new VoiceConfigError('No voice tenant matched this call', 'TENANT_NOT_FOUND');
  }
  if (!tenant.enabled) {
    throw new VoiceConfigError('Voice is disabled for this tenant', 'DISABLED');
  }

  const location = await input.repository.findLocation({
    tenantId: business.tenantId,
    businessId: business.businessId,
    defaultLocationId: business.defaultLocationId,
    ...(input.locationId ? { locationId: input.locationId } : {}),
    ...(phoneNumber ? { phoneNumber } : {}),
    ...(input.city ? { city: input.city } : {}),
    ...(input.zipCode ? { zipCode: input.zipCode } : {}),
    ...(business.routing?.fallbackLocationId
      ? { fallbackLocationId: business.routing.fallbackLocationId }
      : {}),
  });
  if (!location) {
    throw new VoiceConfigError(
      'No voice location matched this call',
      'LOCATION_NOT_FOUND'
    );
  }
  if (location && !location.enabled) {
    throw new VoiceConfigError('Voice is disabled for this location', 'DISABLED');
  }

  const featureFlags = {
    ...defaultFeatureFlags,
    ...tenant.featureFlags,
    ...business.featureFlags,
    ...location.featureFlags,
  };
  const runtimeLimits = {
    ...defaultRuntimeLimits,
    ...tenant.runtimeLimits,
    ...business.runtimeLimits,
    ...location.runtimeLimits,
  };
  const emergencyTransferNumber =
    location.emergencyRouting?.transferNumber ??
    business.emergencyRouting?.transferNumber;
  const emergencyInstructions =
    location.emergencyRouting?.instructions ??
    business.emergencyRouting?.instructions;
  const afterHoursMessage =
    location.afterHoursBehavior?.message ??
    business.afterHoursBehavior?.message;
  const afterHoursTransferNumber =
    location.afterHoursBehavior?.transferNumber ??
    business.afterHoursBehavior?.transferNumber;

  return {
    tenantId: business.tenantId,
    ...(business.brandId ? { brandId: business.brandId } : {}),
    businessId: business.businessId,
    locationId: location.locationId,
    businessName: business.name,
    ...(business.brandName ? { brandName: business.brandName } : {}),
    locationName: location.name,
    phoneNumber: location.phoneNumber ?? business.phoneNumber,
    isMultiLocation: business.isMultiLocation,
    routing: {
      mode: business.isMultiLocation ? 'multi_location' : 'single_location',
      defaultLocationId: business.defaultLocationId,
      routeByPhoneNumber: business.routing?.routeByPhoneNumber ?? true,
      routeByZipCode: business.routing?.routeByZipCode ?? business.isMultiLocation,
      routeByCity: business.routing?.routeByCity ?? business.isMultiLocation,
      ...(business.routing?.fallbackLocationId
        ? { fallbackLocationId: business.routing.fallbackLocationId }
        : {}),
    },
    providers: {
      ...defaultProviders,
      ...tenant.providers,
      ...business.providers,
      ...location.providers,
    },
    featureFlags,
    runtimeLimits,
    services: location.services ?? business.services,
    serviceAreas: location.serviceAreas ?? business.serviceAreas,
    pricingRules: location.pricingRules ?? business.pricingRules,
    faqs: location.faqs ?? business.faqs,
    policies: location.policies ?? business.policies,
    emergencyRouting: {
      enabled:
        location.emergencyRouting?.enabled ??
        business.emergencyRouting?.enabled ??
        featureFlags.emergencyRoutingEnabled,
      ...(emergencyTransferNumber
        ? { transferNumber: emergencyTransferNumber }
        : {}),
      ...(emergencyInstructions ? { instructions: emergencyInstructions } : {}),
    },
    afterHoursBehavior: {
      mode:
        location.afterHoursBehavior?.mode ??
        business.afterHoursBehavior?.mode ??
        'answer',
      ...(afterHoursMessage ? { message: afterHoursMessage } : {}),
      ...(afterHoursTransferNumber
        ? { transferNumber: afterHoursTransferNumber }
        : {}),
    },
  };
}
