export type ProviderHealth = {
  provider: string;
  ok: boolean;
  latencyMs?: number;
  checkedAt: Date;
  message?: string;
};
