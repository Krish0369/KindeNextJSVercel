import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnUrl = searchParams.get("return_url");
  const subNav = searchParams.get("sub_nav");
  try {
    const { isAuthenticated } = getKindeServerSession();

    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get raw access token from cookie
    const cookieStore = await cookies();
    const accessTokenCookie = cookieStore.get("access_token");

    if (!accessTokenCookie?.value) {
      return NextResponse.json(
        { error: "No access token available" },
        { status: 401 }
      );
    }

    const tokenString = accessTokenCookie.value;

    // Validate JWT format
    const jwtParts = tokenString.split('.');
    if (jwtParts.length !== 3) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    const issuerUrl = process.env.KINDE_ISSUER_URL;
    if (!issuerUrl) {
      return NextResponse.json(
        { error: "KINDE_ISSUER_URL not configured" },
        { status: 500 }
      );
    }

    // Build query parameters for GET request
    const queryParams = new URLSearchParams();
    if (returnUrl) {
      queryParams.append("return_url", returnUrl);
    }
    if (subNav) {
      queryParams.append("sub_nav", subNav);
    }

    const apiUrl = `${issuerUrl}/account_api/v1/portal_link${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenString}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to generate portal link", details: errorData },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    // If sub_nav was requested but not in the response URL, append it
    if (subNav && data.url) {
      try {
        const url = new URL(data.url);
        // Check if navigation needs to be added to the URL
        if (!url.searchParams.has('sub_nav') && !url.hash.includes('sub_nav')) {
          // Try adding as hash parameter (some portals use hash for navigation)
          const hash = url.hash || '';
          if (!hash.includes('sub_nav')) {
            url.hash = hash ? `${hash}&sub_nav=${subNav}` : `sub_nav=${subNav}`;
            data.url = url.toString();
          }
        }
      } catch (e) {
        // If URL parsing fails, return original
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
