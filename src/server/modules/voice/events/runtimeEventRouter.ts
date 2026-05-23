import type {
  RuntimeEventBus,
  RuntimeEventUnsubscribe,
} from './runtimeEventBus.js';
import type {
  VoiceRuntimeEvent,
  VoiceRuntimeEventHandler,
  VoiceRuntimeEventType,
} from './runtimeEventTypes.js';

export type RuntimeEventRoute = {
  type: VoiceRuntimeEventType | '*';
  handler: VoiceRuntimeEventHandler;
};

export class RuntimeEventRouter {
  private readonly unsubscribers: RuntimeEventUnsubscribe[] = [];

  constructor(private readonly bus: RuntimeEventBus) {}

  register(routes: RuntimeEventRoute[]): void {
    for (const route of routes) {
      this.unsubscribers.push(this.bus.subscribe(route.type, route.handler));
    }
  }

  registerScoped(input: {
    type: VoiceRuntimeEventType | '*';
    tenantId: string;
    handler: VoiceRuntimeEventHandler;
  }): void {
    this.unsubscribers.push(
      this.bus.subscribe(input.type, async event => {
        if (event.scope.tenantId !== input.tenantId) return;
        await input.handler(event);
      })
    );
  }

  dispose(): void {
    for (const unsubscribe of this.unsubscribers.splice(0)) {
      unsubscribe();
    }
  }

  async route(event: VoiceRuntimeEvent): Promise<void> {
    await this.bus.publish(event);
  }
}

export function createRuntimeEventRouter(bus: RuntimeEventBus): RuntimeEventRouter {
  return new RuntimeEventRouter(bus);
}
