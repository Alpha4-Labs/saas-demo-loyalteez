export type LoyalteezEvent = {
  brandId: string;
  eventType: string;
  userEmail: string;
  domain?: string;
  sourceUrl?: string;
  metadata?: Record<string, any>;
};

export type LoyalteezResponse = {
  success: boolean;
  ltzDistributed?: number;
  walletAddress?: string;
  transactionHash?: string;
  error?: string;
};

/**
 * Loyalteez API Wrapper
 * Handles communication with the Loyalteez Reward API
 */
export class LoyalteezService {
  private brandId: string;
  private apiUrl: string;

  constructor(brandId: string) {
    if (!brandId || brandId === 'DEMO_BRAND_ID') {
      throw new Error('LoyalteezService: brandId is required. Set NEXT_PUBLIC_BRAND_ID environment variable.');
    }
    this.brandId = brandId;
    this.apiUrl = 'https://api.loyalteez.app/loyalteez-api/manual-event';
  }

  /**
   * Track an event and reward the user
   */
  async trackEvent(
    eventType: string,
    userEmail: string,
    metadata: Record<string, any> = {}
  ): Promise<LoyalteezResponse> {
    try {
      const payload = {
        brandId: this.brandId,
        eventType: eventType,
        userEmail: userEmail,
        userIdentifier: userEmail,
        domain: 'saas-demo.loyalteez.app',
        sourceUrl: 'https://saas-demo.loyalteez.app/api/manual-event',
        timestamp: new Date().toISOString(),
        ...metadata
      };

      console.log(`[Loyalteez] Sending event: ${eventType} for ${userEmail}`);
      console.log(`[Loyalteez] Brand ID: ${this.brandId.substring(0, 6)}...`);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data;
      try {
          data = JSON.parse(responseText);
      } catch (e) {
          console.error('[Loyalteez] Failed to parse response JSON:', responseText);
          throw new Error(`API returned non-JSON response: ${response.status}`);
      }

      if (!response.ok) {
        console.error('[Loyalteez] API Error Response:', data);
        throw new Error(data.error || `API responded with status: ${response.status}`);
      }

      return data as LoyalteezResponse;

    } catch (error) {
      console.error('[Loyalteez] Error tracking event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export factory function instead of singleton
export function createLoyalteezService(): LoyalteezService {
  const brandId = process.env.NEXT_PUBLIC_BRAND_ID;
  if (!brandId) {
    throw new Error('NEXT_PUBLIC_BRAND_ID environment variable is not set');
  }
  return new LoyalteezService(brandId);
}
