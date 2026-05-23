# Senna 2.0

Clean phone-system workspace for the production voice runtime.

This workspace starts with the core boundaries first:

- canonical voice runtime config
- persistence adapter contracts
- provider interfaces for telephony, STT, LLM, and TTS
- store-backed workflow ports
- SignalWire webhook route placeholders
- testable in-memory adapters

Production adapters for Supabase/Postgres, Redis, SignalWire, Deepgram, OpenAI, and TTS providers should plug into these interfaces without changing workflow code.
