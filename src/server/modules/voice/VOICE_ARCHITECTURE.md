# Voice Module Architecture

This voice system is a multi-tenant, multi-business, multi-location, multi-call realtime voice platform.

Every production call path must preserve:

- `tenantId`
- `businessId`
- `locationId` when available
- `callId`
- `sessionId`

## Tenant, Brand, Business, Location Model

The hierarchy is:

`tenant -> brand? -> business -> location`

`brandId` is optional. `locationId` is optional at the API/config edge, but required internally before any workflow runs.

Single-location clients should not manage locations as a complex product feature. The system creates and uses a default location behind the scenes:

- Tenant: Buckeye Beaver Pools
- Business: Buckeye Beaver Pools
- Location: default

Multi-location brands resolve to real branches:

- Tenant: Valley Service Group
- Brand: Buckeye Beaver Pools
- Business: Buckeye Beaver Pools
- Locations: Buckeye, Peoria, Scottsdale, Mesa

No call, chat, lead, quote, transcript, or analytics record may be impossible to assign to a location. Single-location records use the default location. Multi-location records resolve location by explicit selection, phone number, zip code, city, service area, fallback location, or default location.

The runtime pipeline is:

1. `config/`: resolve tenant, brand, business, concrete location, providers, limits, features.
2. `security/`: validate tenant isolation, webhook, websocket, and rate limits.
3. `transport/` or `widget/`: accept voice stream or widget message.
4. `runtime/`: create live session, tenant context, and concurrency lock.
5. `events/`: publish typed runtime event.
6. `workers/`: process async jobs.
7. `reasoning/` and `llm/`: classify intent, answer business questions, plan tools.
8. `tools/` and `workflows/`: pricing, service area, lead capture, booking, emergency, transfer.
9. `integrations/`: route CRM, POS, reservation, scheduling, and vertical requests through adapters.
10. `providers/`: OpenAI, Deepgram, SignalWire, TTS providers.
11. `persistence/`: store calls, sessions, transcripts, conversations, leads, analytics.
12. `observability/`: logs, traces, latency, provider health, errors.

## Approved Top-Level Modules

- `audio/`: realtime TTS chunks, playback queues, assistant speech state, audio buffering.
- `business/`: business knowledge, pricing knowledge, FAQ knowledge, policy knowledge, service area knowledge.
- `conversation/`: turn detection, interruption handling, duplex coordination, barge-in control, speech turns.
- `distributed/`: region coordination, session state sync, event queues, failover, retry, latency monitoring.
- `events/`: runtime event bus, event publishing, event subscribing, event routing.
- `integrations/`: adapter-based CRM, POS, reservation, scheduling, and vertical system integrations.
- `llm/`: LLM reasoning entrypoints, OpenAI tool reasoner, model-facing response decisions.
- `metrics/`: runtime and voice metrics.
- `orchestrator/`: high-level live voice orchestration.
- `persistence/`: conversation, transcript, lead, analytics, and call state storage abstraction.
- `providers/`: external infrastructure providers such as OpenAI, Deepgram, SignalWire, Twilio, ElevenLabs, Cartesia.
- `reasoning/`: intent classification, response planning, business question answering, tool decision logic, conversation memory.
- `runtime/`: live runtime execution, tenant context, session registry, runtime pipeline, concurrency guard.
- `tools/`: actual callable voice tools used by the LLM/tool reasoner.
- `transport/`: sockets, telephony, streaming, webhook, and realtime audio movement.
- `tts/`: text-to-speech abstraction and provider-facing speech output logic.
- `workers/`: async job processing for transcripts, reasoning, leads, analytics, retry, and failover.
- `workflows/`: lead capture, pricing, booking, emergency handling, after-hours, and transfer workflows.
- `widget/`: widget-facing voice/chat runtime entrypoints.

## Deprecated Modules

Do not recreate these as top-level voice modules:

- `decision/`
- `departments/`
- `routing/`
- `state/`
- standalone `openai/`

Use `reasoning/`, `orchestrator/`, `runtime/`, `transport/`, and `providers/` instead.

## Provider Direction

The first-class production stack is:

- SignalWire for telephony and media streams.
- Deepgram for STT.
- OpenAI for LLM reasoning and tool selection.
- Deepgram Voice for TTS.

Providers are adapters. Workflows and runtime code should depend on provider ports, not SDK clients.
