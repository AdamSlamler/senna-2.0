export class VoiceProviderError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly retryable: boolean
  ) {
    super(message);
    this.name = 'VoiceProviderError';
  }
}
