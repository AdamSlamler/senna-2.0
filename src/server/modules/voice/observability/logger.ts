import type { TenantScope } from '../runtime/liveRuntimeTenantContext.js';

export type VoiceLogLevel = 'debug' | 'info' | 'warn' | 'error';

export type VoiceLogger = {
  log(input: {
    level: VoiceLogLevel;
    message: string;
    scope?: TenantScope;
    metadata?: Record<string, unknown>;
  }): void;
};

export const consoleVoiceLogger: VoiceLogger = {
  log(input) {
    const payload = {
      scope: input.scope,
      metadata: input.metadata,
    };
    console[input.level](`[voice] ${input.message}`, payload);
  },
};
