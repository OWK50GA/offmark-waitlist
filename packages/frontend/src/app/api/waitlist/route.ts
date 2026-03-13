import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName } = body;

    // Validate email
    if (!email || !firstName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and First name required' 
        },
        { status: 400 }
      );
    }

    // Get backend API URL from environment
    const backendUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    
    // Forward request to backend
    const response = await fetch(`${backendUrl}/api/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, firstName }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to join waitlist' 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!'
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}