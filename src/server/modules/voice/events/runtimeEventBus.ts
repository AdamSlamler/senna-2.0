import type {
  VoiceRuntimeEvent,
  VoiceRuntimeEventHandler,
  VoiceRuntimeEventType,
} from './runtimeEventTypes.js';

export type RuntimeEventUnsubscribe = () => void;

export class RuntimeEventBus {
  private readonly handlers = new Map<
    VoiceRuntimeEventType | '*',
    Set<VoiceRuntimeEventHandler>
  >();
  private readonly history: VoiceRuntimeEvent[] = [];

  subscribe(
    type: VoiceRuntimeEventType | '*',
    handler: VoiceRuntimeEventHandler
  ): RuntimeEventUnsubscribe {
    const handlersForType = this.handlers.get(type) ?? new Set();
    handlersForType.add(handler);
    this.handlers.set(type, handlersForType);

    return () => {
      handlersForType.delete(handler);
      if (handlersForType.size === 0) {
        this.handlers.delete(type);
      }
    };
  }

  async publish(event: VoiceRuntimeEvent): Promise<void> {
    this.history.push(event);
    const handlers = [
      ...(this.handlers.get(event.type) ?? []),
      ...(this.handlers.get('*') ?? []),
    ];

    await Promise.all(handlers.map(handler => handler(event)));
  }

  recent(limit = 100): VoiceRuntimeEvent[] {
    return this.history.slice(-limit);
  }

  clearHistory(): void {
    this.history.length = 0;
  }
}

export function createRuntimeEventBus(): RuntimeEventBus {
  return new RuntimeEventBus();
}
