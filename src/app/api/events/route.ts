import { NextResponse } from 'next/server';
import { loyalteez } from '@/lib/loyalteez';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    return NextResponse.json(
      { success: false, error: 'Internal Server Error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
