import type { VoiceRuntimeConfig } from '../../config/providerVoiceConfigResolver.js';

export type VoiceCall = {
  id: string;
  tenantId: string;
  businessId: string;
  locationId: string;
  providerCallId?: string;
  fromNumber?: string;
  toNumber: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'canceled';
  startedAt?: Date;
  endedAt?: Date;
};

export type VoiceSession = {
  id: string;
  callId: string;
  tenantId: string;
  businessId: string;
  locationId: string;
  providerCallId?: string;
  streamId?: string;
  status: 'starting' | 'active' | 'recovering' | 'ended';
  config: VoiceRuntimeConfig;
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationTurn = {
  id: string;
  sessionId: string;
  callId: string;
  role: 'caller' | 'assistant' | 'system' | 'tool';
  content: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
};

export type TranscriptSegment = {
  id: string;
  sessionId: string;
  callId: string;
  speaker: 'caller' | 'assistant';
  text: string;
  isFinal: boolean;
  confidence?: number;
  createdAt: Date;
};

export type VoiceLead = {
  id: string;
  tenantId: string;
  businessId: string;
  locationId: string;
  callId?: string;
  sessionId?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  service?: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  createdAt: Date;
  updatedAt: Date;
};

export type RuntimeEvent = {
  id: string;
  tenantId: string;
  businessId: string;
  locationId: string;
  callId?: string;
  sessionId?: string;
  severity: 'debug' | 'info' | 'warn' | 'error';
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
};

export type ToolExecution = {
  id: string;
  sessionId: string;
  callId: string;
  toolName: string;
  status: 'pending' | 'completed' | 'failed';
  request: Record<string, unknown>;
  response?: Record<string, unknown>;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
};

export type VoiceCallStore = {
  createCall(call: Omit<VoiceCall, 'id'>): Promise<VoiceCall>;
  updateCall(call: VoiceCall): Promise<VoiceCall>;
  findCallByProviderCallId(providerCallId: string): Promise<VoiceCall | null>;
};

export type VoiceSessionStore = {
  createSession(session: Omit<VoiceSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<VoiceSession>;
  findSession(sessionId: string): Promise<VoiceSession | null>;
  findSessionByProviderCallId(providerCallId: string): Promise<VoiceSession | null>;
  findSessionByStreamId(streamId: string): Promise<VoiceSession | null>;
  countActiveSessions(input: {
    tenantId: string;
    businessId?: string;
    locationId?: string;
  }): Promise<number>;
  updateSession(session: VoiceSession): Promise<VoiceSession>;
};

export type VoiceConversationStore = {
  appendTurn(turn: Omit<ConversationTurn, 'id' | 'createdAt'>): Promise<ConversationTurn>;
  listTurns(sessionId: string): Promise<ConversationTurn[]>;
};

export type VoiceTranscriptStore = {
  appendSegment(segment: Omit<TranscriptSegment, 'id' | 'createdAt'>): Promise<TranscriptSegment>;
  listSegments(callId: string): Promise<TranscriptSegment[]>;
  finalizeTranscript(callId: string): Promise<void>;
};

export type VoiceLeadStore = {
  createLead(lead: Omit<VoiceLead, 'id' | 'createdAt' | 'updatedAt'>): Promise<VoiceLead>;
  updateLead(lead: VoiceLead): Promise<VoiceLead>;
};

export type VoiceEventStore = {
  recordRuntimeEvent(event: Omit<RuntimeEvent, 'id' | 'createdAt'>): Promise<RuntimeEvent>;
};

export type VoiceToolExecutionStore = {
  createToolExecution(execution: Omit<ToolExecution, 'id' | 'createdAt' | 'completedAt'>): Promise<ToolExecution>;
  updateToolExecution(execution: ToolExecution): Promise<ToolExecution>;
};

export type VoicePersistenceAdapter = {
  calls: VoiceCallStore;
  sessions: VoiceSessionStore;
  conversations: VoiceConversationStore;
  transcripts: VoiceTranscriptStore;
  leads: VoiceLeadStore;
  events: VoiceEventStore;
  toolExecutions: VoiceToolExecutionStore;
};
