import { describe, expect, it } from 'vitest';
import { createRuntimeEventBus } from '../runtimeEventBus.js';
import { createRuntimeEventPublisher } from '../runtimeEventPublisher.js';
import { createRuntimeEventRouter } from '../runtimeEventRouter.js';
import { createRuntimeEvent } from '../runtimeEventTypes.js';

const scope = {
  tenantId: 'tenant_1',
  businessId: 'business_1',
  locationId: 'location_1',
};

describe('RuntimeEventBus', () => {
  it('publishes typed events to direct and wildcard subscribers', async () => {
    const bus = createRuntimeEventBus();
    const publisher = createRuntimeEventPublisher(bus);
    const received: string[] = [];

    bus.subscribe('voice.call.started', event => {
      received.push(event.type);
    });
    bus.subscribe('*', event => {
      received.push(`any:${event.type}`);
    });

    await publisher.publish({
      type: 'voice.call.started',
      scope,
      payload: { providerCallId: 'call_1' },
    });

    expect(received).toEqual([
      'voice.call.started',
      'any:voice.call.started',
    ]);
    expect(bus.recent()).toHaveLength(1);
  });

  it('routes events by tenant scope', async () => {
    const bus = createRuntimeEventBus();
    const router = createRuntimeEventRouter(bus);
    const received: string[] = [];

    router.registerScoped({
      type: '*',
      tenantId: 'tenant_1',
      handler: event => {
        received.push(event.scope.tenantId);
      },
    });

    await router.route(
      createRuntimeEvent({
        type: 'voice.call.started',
        scope,
      })
    );
    await router.route(
      createRuntimeEvent({
        type: 'voice.call.started',
        scope: {
          tenantId: 'tenant_2',
          businessId: 'business_2',
          locationId: 'location_2',
        },
      })
    );

    expect(received).toEqual(['tenant_1']);
  });
});
