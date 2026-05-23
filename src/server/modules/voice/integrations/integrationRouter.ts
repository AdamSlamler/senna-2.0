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
    capability: input.request.capability,
    ...(input.provider ? { provider: input.provider } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.vertical ? { vertical: input.vertical } : {}),
  });

  if (!adapter) {
    throw new IntegrationRouteError(
      `No integration adapter found for capability: ${input.request.capability}`
    );
  }

  return adapter.execute(input.request);
}
