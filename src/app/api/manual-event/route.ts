export const runtime = 'edge';

export async function POST(request: Request) {
  // 1. Debug logging - verify we hit the function
  console.log('[API] POST /api/manual-event hit');

  try {
    // 2. Check Env Var
    const brandId = process.env.NEXT_PUBLIC_BRAND_ID;
    console.log('[API] Env check:', { hasBrandId: !!brandId });
    
    if (!brandId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Configuration Error: NEXT_PUBLIC_BRAND_ID is missing'
      }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }

    // 3. Parse Body
    let body;
    try {
      const text = await request.text(); // Get text first to debug
      console.log('[API] Request body text length:', text.length);
      body = JSON.parse(text);
    } catch (e) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON body'
      }), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }

    // 4. Import dynamic dependency only when needed (isolate import errors)
    const { loyalteez } = await import('@/lib/loyalteez');
    
    const { eventType, userEmail, metadata } = body;

    if (!eventType || !userEmail) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing eventType or userEmail'
      }), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }

    // 5. Call Service
    const result = await loyalteez.trackEvent(eventType, userEmail, metadata);

    if (result.error) {
      return new Response(JSON.stringify(result), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }

    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' }});

  } catch (error) {
    console.error('[API] CRITICAL ERROR:', error);
    
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal Server Error',
      details: message,
      stack: stack // Debug only
    }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}
