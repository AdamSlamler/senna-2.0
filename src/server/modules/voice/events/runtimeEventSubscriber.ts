import type {
  RuntimeEventBus,
  RuntimeEventUnsubscribe,
} from './runtimeEventBus.js';
import type {
  VoiceRuntimeEventHandler,
  VoiceRuntimeEventType,
} from './runtimeEventTypes.js';

export class RuntimeEventSubscriber {
  constructor(private readonly bus: RuntimeEventBus) {}

  on(
    type: VoiceRuntimeEventType,
    handler: VoiceRuntimeEventHandler
  ): RuntimeEventUnsubscribe {
    return this.bus.subscribe(type, handler);
  }

  onAny(handler: VoiceRuntimeEventHandler): RuntimeEventUnsubscribe {
    return this.bus.subscribe('*', handler);
  }
}

export function createRuntimeEventSubscriber(
  bus: RuntimeEventBus
): RuntimeEventSubscriber {
  return new RuntimeEventSubscriber(bus);
}
