import type { RuntimeEventBus } from './runtimeEventBus.js';
import {
  createRuntimeEvent,
  type VoiceRuntimeEventScope,
  type VoiceRuntimeEventSeverity,
  type VoiceRuntimeEventType,
} from './runtimeEventTypes.js';

export class RuntimeEventPublisher {
  constructor(private readonly bus: RuntimeEventBus) {}

  publish<TPayload extends Record<string, unknown>>(input: {
    type: VoiceRuntimeEventType;
    severity?: VoiceRuntimeEventSeverity;
    scope: VoiceRuntimeEventScope;
    payload?: TPayload;
  }): Promise<void> {
    return this.bus.publish(createRuntimeEvent(input));
  }
}

export function createRuntimeEventPublisher(
  bus: RuntimeEventBus
): RuntimeEventPublisher {
  return new RuntimeEventPublisher(bus);
}
