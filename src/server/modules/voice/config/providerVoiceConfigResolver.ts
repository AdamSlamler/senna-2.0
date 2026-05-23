export type VoiceProviderName =
  | 'signalwire'
  | 'deepgram'
  | 'openai'
  | 'deepgram_voice';

export type VoiceProviderConfig = {
  telephony: VoiceProviderName;
  stt: VoiceProviderName;
  llm: VoiceProviderName;
  tts: VoiceProviderName;
};

export type VoiceFeatureFlags = {
  smsEnabled: boolean;
  bookingEnabled: boolean;
  recordingEnabled: boolean;
  emergencyRoutingEnabled: boolean;
  humanTransferEnabled: boolean;
};

export type VoiceRuntimeLimits = {
  maxCallDurationSeconds: number;
  maxTranscriptCharacters: number;
  maxToolExecutionsPerCall: number;
  maxRealtimeReconnects: number;
  maxConcurrentTenantCalls: number;
  maxConcurrentBusinessCalls: number;
  maxConcurrentLocationCalls: number;
  maxCallStartsPerMinute: number;
};

export type VoiceService = {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
};

export type VoiceServiceArea = {
  id: string;
  city?: string;
  state?: string;
  zipCodes: string[];
  enabled: boolean;
};

export type VoicePricingRule = {
  id: string;
  serviceId?: string;
  label: string;
  basePriceCents?: number;
  recurringPriceCents?: number;
  enabled: boolean;
};

export type VoiceFaq = {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
};

export type VoicePolicy = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type VoiceAfterHoursBehavior = {
  mode: 'answer' | 'voicemail' | 'transfer' | 'closed_message';
  message?: string;
  transferNumber?: string;
};

export type VoiceEmergencyRouting = {
  enabled: boolean;
  transferNumber?: string;
  instructions?: string;
};

export type VoiceRuntimeConfig = {
  tenantId: string;
  brandId?: string;
  businessId: string;
  locationId: string;
  businessName: string;
  brandName?: string;
  locationName: string;
  phoneNumber: string;
  isMultiLocation: boolean;
  routing: {
    mode: 'single_location' | 'multi_location';
    defaultLocationId: string;
    routeByPhoneNumber: boolean;
    routeByZipCode: boolean;
    routeByCity: boolean;
    fallbackLocationId?: string;
  };
  providers: VoiceProviderConfig;
  featureFlags: VoiceFeatureFlags;
  runtimeLimits: VoiceRuntimeLimits;
  services: VoiceService[];
  serviceAreas: VoiceServiceArea[];
  pricingRules: VoicePricingRule[];
  faqs: VoiceFaq[];
  policies: VoicePolicy[];
  emergencyRouting: VoiceEmergencyRouting;
  afterHoursBehavior: VoiceAfterHoursBehavior;
};

export const defaultProviders: VoiceProviderConfig = {
  telephony: 'signalwire',
  stt: 'deepgram',
  llm: 'openai',
  tts: 'deepgram_voice',
};

export const defaultFeatureFlags: VoiceFeatureFlags = {
  smsEnabled: false,
  bookingEnabled: false,
  recordingEnabled: false,
  emergencyRoutingEnabled: true,
  humanTransferEnabled: false,
};

export const defaultRuntimeLimits: VoiceRuntimeLimits = {
  maxCallDurationSeconds: 900,
  maxTranscriptCharacters: 80_000,
  maxToolExecutionsPerCall: 20,
  maxRealtimeReconnects: 3,
  maxConcurrentTenantCalls: 500,
  maxConcurrentBusinessCalls: 100,
  maxConcurrentLocationCalls: 25,
  maxCallStartsPerMinute: 120,
};
