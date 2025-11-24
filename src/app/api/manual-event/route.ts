import { NextResponse } from 'next/server';
import { loyalteez } from '@/lib/loyalteez';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Check if NEXT_PUBLIC_BRAND_ID is set in the environment
    if (!process.env.NEXT_PUBLIC_BRAND_ID) {
      console.error('NEXT_PUBLIC_BRAND_ID environment variable is missing');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error: NEXT_PUBLIC_BRAND_ID is missing',
          details: 'Please set this variable in Cloudflare Pages Settings'
        },
        { status: 500 }
      );
    }

    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { eventType, userEmail, metadata } = body;

    if (!eventType || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing eventType or userEmail' },
        { status: 400 }
      );
    }

    // Call Loyalteez API
    const result = await loyalteez.trackEvent(eventType, userEmail, metadata);

    if (result.error) {
        return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Route Error:', error);
    // Safely serialize error
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
