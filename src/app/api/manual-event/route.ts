export const runtime = 'edge';

export async function POST(request: Request) {
  console.log('[API] POST /api/manual-event hit');

  try {
    // Get brand ID from environment (check at runtime, not module load)
    const brandId = process.env.NEXT_PUBLIC_BRAND_ID;
    console.log('[API] Env check:', { hasBrandId: !!brandId, brandIdPrefix: brandId?.substring(0, 6) });
    
    if (!brandId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Configuration Error: NEXT_PUBLIC_BRAND_ID is missing',
        hint: 'Set this variable in Cloudflare Pages Settings → Variables and Secrets'
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse Body
    let body;
    try {
      const text = await request.text();
      console.log('[API] Request body:', text.substring(0, 100));
      body = JSON.parse(text);
    } catch (e) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON body'
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create service instance (lazy initialization)
    const { createLoyalteezService } = await import('@/lib/loyalteez');
    const loyalteez = createLoyalteezService();
    
    const { eventType, userEmail, metadata } = body;

    if (!eventType || !userEmail) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing eventType or userEmail'
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call Service
    console.log('[API] Calling Loyalteez service...');
    const result = await loyalteez.trackEvent(eventType, userEmail, metadata);
    console.log('[API] Result:', { success: result.success, error: result.error });

    if (result.error) {
      return new Response(JSON.stringify(result), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(result), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API] CRITICAL ERROR:', error);
    
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : '';

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal Server Error',
      details: message,
      stack: stack
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
