import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the target URL from the query parameter
    const targetUrl = request.nextUrl.searchParams.get('url');
    
    if (!targetUrl) {
      return NextResponse.json(
        { error: "Missing 'url' parameter" },
        { status: 400 }
      );
    }
    
    // Validate the URL to ensure it points to your device
    if (!targetUrl.startsWith('http://192.168.77.15')) {
      return NextResponse.json(
        { error: "URL not allowed" },
        { status: 403 }
      );
    }
    
    console.log(`Proxying request to: ${targetUrl}`);
    
    // Make the request to the target URL
    const response = await fetch(targetUrl, {
      headers: {
        "Accept": "*/*",
      },
    });
    
    if (!response.ok) {
      console.error(`Proxy target returned error: ${response.status}`);
      return NextResponse.json(
        { error: `Target returned ${response.status}` },
        { status: response.status }
      );
    }
    
    // Get the response body as text
    const text = await response.text();
    console.log(`Received ${text.length} characters from target`);
    
    // Return the response with appropriate CORS headers
    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error("Proxy error:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch from target URL" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  // Handle OPTIONS requests for CORS preflight
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400' // 24 hours
    }
  });
}