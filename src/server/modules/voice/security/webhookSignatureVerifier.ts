export type WebhookSignatureVerifier = {
  verify(input: {
    rawBody: string;
    signature?: string;
    timestamp?: string;
  }): Promise<boolean>;
};

export const allowUnsignedWebhooksForDevelopment: WebhookSignatureVerifier = {
  async verify() {
    return true;
  },
};
