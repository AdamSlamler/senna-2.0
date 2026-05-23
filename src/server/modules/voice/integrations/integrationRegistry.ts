export type IntegrationVertical =
  | 'home_services'
  | 'restaurants'
  | 'medical'
  | 'salons';

export type IntegrationCategory =
  | 'crm'
  | 'reservation'
  | 'pos'
  | 'scheduling'
  | 'notification';

export type IntegrationContext = {
  tenantId: string;
  businessId: string;
  locationId: string;
  brandId?: string;
};

export type IntegrationRequest<TPayload = Record<string, unknown>> = {
  context: IntegrationContext;
  capability: string;
  payload: TPayload;
};

export type IntegrationResult<TData = Record<string, unknown>> = {
  ok: boolean;
  provider: string;
  capability: string;
  data?: TData;
  errorMessage?: string;
  retryable?: boolean;
};

export type IntegrationAdapter = {
  provider: string;
  category: IntegrationCategory;
  verticals: IntegrationVertical[];
  capabilities: string[];
  execute(request: IntegrationRequest): Promise<IntegrationResult>;
};

export type IntegrationRegistry = {
  register(adapter: IntegrationAdapter): void;
  find(input: {
    provider?: string;
    category?: IntegrationCategory;
    vertical?: IntegrationVertical;
    capability: string;
  }): IntegrationAdapter | null;
  list(): IntegrationAdapter[];
};

export function createIntegrationRegistry(
  initialAdapters: IntegrationAdapter[] = []
): IntegrationRegistry {
  const adapters = new Map<string, IntegrationAdapter>();

  for (const adapter of initialAdapters) {
    adapters.set(adapter.provider, adapter);
  }

  return {
    register(adapter) {
      adapters.set(adapter.provider, adapter);
    },
    find(input) {
      return (
        [...adapters.values()].find(adapter => {
          if (input.provider && adapter.provider !== input.provider) return false;
          if (input.category && adapter.category !== input.category) return false;
          if (input.vertical && !adapter.verticals.includes(input.vertical)) {
            return false;
          }
          return adapter.capabilities.includes(input.capability);
        }) ?? null
      );
    },
    list() {
      return [...adapters.values()];
    },
  };
}
