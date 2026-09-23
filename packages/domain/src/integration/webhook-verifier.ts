export interface WebhookVerificationContext {
  payload: string | Buffer;
  headers: Record<string, string | string[] | undefined>;
  secretReference?: string | undefined;
}

/**
 * Binding Constraint #3:
 * Webhook verification is provider-independent.
 * Providers specify their own verification strategy (HMAC, JWT, API Key signature, Mutual TLS).
 */
export interface WebhookVerificationStrategy {
  verify(context: WebhookVerificationContext): Promise<boolean>;
}

export class MockProviderWebhookStrategy implements WebhookVerificationStrategy {
  constructor(private readonly expectedHeader: string = 'x-provider-signature') {}

  public async verify(context: WebhookVerificationContext): Promise<boolean> {
    const signature = context.headers[this.expectedHeader];
    return Boolean(signature && signature !== 'invalid');
  }
}
