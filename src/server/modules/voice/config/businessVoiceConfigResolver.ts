import type {
  VoiceAfterHoursBehavior,
  VoiceEmergencyRouting,
  VoiceFaq,
  VoiceFeatureFlags,
  VoicePolicy,
  VoicePricingRule,
  VoiceProviderConfig,
  VoiceRuntimeLimits,
  VoiceService,
  VoiceServiceArea,
} from './providerVoiceConfigResolver.js';

export type TenantVoiceRecord = {
  tenantId: string;
  name: string;
  enabled: boolean;
  providers?: Partial<VoiceProviderConfig>;
  featureFlags?: Partial<VoiceFeatureFlags>;
  runtimeLimits?: Partial<VoiceRuntimeLimits>;
};

export type BusinessVoiceRecord = {
  tenantId: string;
  brandId?: string;
  businessId: string;
  name: string;
  brandName?: string;
  phoneNumber: string;
  enabled: boolean;
  defaultLocationId: string;
  isMultiLocation: boolean;
  routing?: {
    routeByPhoneNumber?: boolean;
    routeByZipCode?: boolean;
    routeByCity?: boolean;
    fallbackLocationId?: string;
  };
  providers?: Partial<VoiceProviderConfig>;
  featureFlags?: Partial<VoiceFeatureFlags>;
  runtimeLimits?: Partial<VoiceRuntimeLimits>;
  services: VoiceService[];
  serviceAreas: VoiceServiceArea[];
  pricingRules: VoicePricingRule[];
  faqs: VoiceFaq[];
  policies: VoicePolicy[];
  emergencyRouting?: Partial<VoiceEmergencyRouting>;
  afterHoursBehavior?: Partial<VoiceAfterHoursBehavior>;
};

export type LocationVoiceRecord = {
  tenantId: string;
  brandId?: string;
  businessId: string;
  locationId: string;
  name: string;
  phoneNumber?: string;
  cities?: string[];
  zipCodes?: string[];
  enabled: boolean;
  providers?: Partial<VoiceProviderConfig>;
  featureFlags?: Partial<VoiceFeatureFlags>;
  runtimeLimits?: Partial<VoiceRuntimeLimits>;
  services?: VoiceService[];
  serviceAreas?: VoiceServiceArea[];
  pricingRules?: VoicePricingRule[];
  faqs?: VoiceFaq[];
  policies?: VoicePolicy[];
  emergencyRouting?: Partial<VoiceEmergencyRouting>;
  afterHoursBehavior?: Partial<VoiceAfterHoursBehavior>;
};

export type VoiceConfigRepository = {
  findTenant(tenantId: string): Promise<TenantVoiceRecord | null>;
  findBusiness(input: {
    tenantId?: string;
    businessId?: string;
    phoneNumber?: string;
  }): Promise<BusinessVoiceRecord | null>;
  findLocation(input: {
    tenantId: string;
    businessId: string;
    locationId?: string;
    phoneNumber?: string;
    city?: string;
    zipCode?: string;
    defaultLocationId?: string;
    fallbackLocationId?: string;
  }): Promise<LocationVoiceRecord | null>;
};
