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
    this.brandId = brandId;
    this.apiUrl = 'https://api.loyalteez.app/loyalteez-api/manual-event';
    
    if (this.brandId === 'DEMO_BRAND_ID') {
        console.warn('[Loyalteez] WARNING: Using default DEMO_BRAND_ID. Events will likely fail. Set NEXT_PUBLIC_BRAND_ID in .env.local');
    }
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
      // NOTE: Server expects specific field names. 
      // `userEmail` is mapped to `userIdentifier` in some contexts, but manual-event handler supports `userEmail`.
      // `domain` and `sourceUrl` are validated.
      
      const payload = {
        brandId: this.brandId,
        eventType: eventType,
        userEmail: userEmail,
        userIdentifier: userEmail, // Provide both to be safe as per server logic
        domain: 'saas-demo.loyalteez.app', // Must be a valid looking domain string, not just 'demo-saas'
        sourceUrl: 'https://saas-demo.loyalteez.app/api/events', // Must be a valid URL
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
      // Fail gracefully - don't break the app flow
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton instance for server-side use
export const loyalteez = new LoyalteezService(process.env.NEXT_PUBLIC_BRAND_ID || 'DEMO_BRAND_ID');
