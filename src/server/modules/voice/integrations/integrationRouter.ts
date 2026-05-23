import type {
  IntegrationCategory,
  IntegrationRegistry,
  IntegrationRequest,
  IntegrationResult,
  IntegrationVertical,
} from './integrationRegistry.js';

export class IntegrationRouteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IntegrationRouteError';
  }
}

export async function routeIntegrationRequest(input: {
  registry: IntegrationRegistry;
  provider?: string;
  category?: IntegrationCategory;
  vertical?: IntegrationVertical;
  request: IntegrationRequest;
}): Promise<IntegrationResult> {
  const adapter = input.registry.find({
    provider: input.provider,
    category: input.category,
    vertical: input.vertical,
    capability: input.request.capability,
  });

  if (!adapter) {
    throw new IntegrationRouteError(
      `No integration adapter found for capability: ${input.request.capability}`
    );
  }

  return adapter.execute(input.request);
}
