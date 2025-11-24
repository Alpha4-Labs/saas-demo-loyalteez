export const runtime = 'edge';

export async function POST(request: Request) {
  // MINIMAL TEST - No imports, no complexity
  try {
    const brandId = process.env.NEXT_PUBLIC_BRAND_ID;
    
    return new Response(JSON.stringify({
      success: true,
      message: 'API route is working',
      hasBrandId: !!brandId,
      brandIdPrefix: brandId?.substring(0, 6) || 'missing'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Caught error',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
