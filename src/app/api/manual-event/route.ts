// Try using GET to test if POST is the issue
export const runtime = 'edge';

export async function GET() {
  return new Response(JSON.stringify({
    success: true,
    message: 'GET endpoint works',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request: Request) {
  try {
    // Read body as text first
    const bodyText = await request.text();
    console.log('[API] Body received:', bodyText);
    
    const brandId = process.env.NEXT_PUBLIC_BRAND_ID;
    
    return new Response(JSON.stringify({
      success: true,
      message: 'POST endpoint works',
      hasBrandId: !!brandId,
      brandIdPrefix: brandId?.substring(0, 6) || 'missing',
      bodyLength: bodyText.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Caught error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : ''
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
