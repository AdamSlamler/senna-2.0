import type {
  ConversationTurn,
  RuntimeEvent,
  ToolExecution,
  TranscriptSegment,
  VoiceCall,
  VoiceLead,
  VoicePersistenceAdapter,
  VoiceSession,
} from '../persistenceAdapter.js';

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createMemoryVoicePersistenceAdapter(): VoicePersistenceAdapter {
  const calls = new Map<string, VoiceCall>();
  const sessions = new Map<string, VoiceSession>();
  const turns: ConversationTurn[] = [];
  const segments: TranscriptSegment[] = [];
  const leads = new Map<string, VoiceLead>();
  const events: RuntimeEvent[] = [];
  const toolExecutions = new Map<string, ToolExecution>();

  return {
    calls: {
      async createCall(call) {
        const created = { ...call, id: id('call') };
        calls.set(created.id, created);
        return created;
      },
      async updateCall(call) {
        calls.set(call.id, call);
        return call;
      },
      async findCallByProviderCallId(providerCallId) {
        return [...calls.values()].find(call => call.providerCallId === providerCallId) ?? null;
      },
    },
    sessions: {
      async createSession(session) {
        const now = new Date();
        const created = { ...session, id: id('session'), createdAt: now, updatedAt: now };
        sessions.set(created.id, created);
        return created;
      },
      async findSession(sessionId) {
        return sessions.get(sessionId) ?? null;
      },
      async findSessionByProviderCallId(providerCallId) {
        return [...sessions.values()].find(session => session.providerCallId === providerCallId) ?? null;
      },
      async findSessionByStreamId(streamId) {
        return [...sessions.values()].find(session => session.streamId === streamId) ?? null;
      },
      async countActiveSessions(input) {
        return [...sessions.values()].filter(session => {
          const active =
            session.status === 'starting' ||
            session.status === 'active' ||
            session.status === 'recovering';
          if (!active) return false;
          if (session.tenantId !== input.tenantId) return false;
          if (input.businessId && session.businessId !== input.businessId) {
            return false;
          }
          if (input.locationId && session.locationId !== input.locationId) {
            return false;
          }
          return true;
        }).length;
      },
      async updateSession(session) {
        const updated = { ...session, updatedAt: new Date() };
        sessions.set(updated.id, updated);
        return updated;
      },
    },
    conversations: {
      async appendTurn(turn) {
        const created = { ...turn, id: id('turn'), createdAt: new Date() };
        turns.push(created);
        return created;
      },
      async listTurns(sessionId) {
        return turns.filter(turn => turn.sessionId === sessionId);
      },
    },
    transcripts: {
      async appendSegment(segment) {
        const created = { ...segment, id: id('transcript'), createdAt: new Date() };
        segments.push(created);
        return created;
      },
      async listSegments(callId) {
        return segments.filter(segment => segment.callId === callId);
      },
      async finalizeTranscript() {},
    },
    leads: {
      async createLead(lead) {
        const now = new Date();
        const created = { ...lead, id: id('lead'), createdAt: now, updatedAt: now };
        leads.set(created.id, created);
        return created;
      },
      async updateLead(lead) {
        const updated = { ...lead, updatedAt: new Date() };
        leads.set(updated.id, updated);
        return updated;
      },
    },
    events: {
      async recordRuntimeEvent(event) {
        const created = { ...event, id: id('event'), createdAt: new Date() };
        events.push(created);
        return created;
      },
    },
    toolExecutions: {
      async createToolExecution(execution) {
        const created = { ...execution, id: id('tool'), createdAt: new Date() };
        toolExecutions.set(created.id, created);
        return created;
      },
      async updateToolExecution(execution) {
        toolExecutions.set(execution.id, execution);
        return execution;
      },
    },
  };
}
