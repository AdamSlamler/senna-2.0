# Voice Module

The voice module owns Senna's phone-system runtime.

Clean module layout:

- `config/`: tenant, business, location, provider, feature flag, and runtime limit resolution
- `integrations/`: CRM, POS, reservation, scheduling, and vertical adapters
- `persistence/`: storage ports and test adapters
- `providers/`: SignalWire, Deepgram, OpenAI, and TTS ports/adapters
- `transport/`: HTTP/webhook/socket entrypoints and streaming transport
- `workflows/`: call, media, lead, pricing, booking, emergency, transfer, and after-hours orchestration

Rules:

- Runtime workflows depend on interfaces, not concrete vendors.
- Provider adapters do not own business logic.
- Persistence adapters do not own call workflow decisions.
- Every tenant, business, location, call, session, transcript, tool execution, and event carries tenant/business scope.
- Multi-call concurrency is enforced before creating live sessions.
