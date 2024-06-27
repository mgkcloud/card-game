import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import config from "@/config";

export const dynamic = "force-dynamic";

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      // Optionally, you can set a cookie here to indicate successful auth
      cookies().set('auth_status', 'authenticated', { httpOnly: true, secure: true });
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(new URL('/signin', getOrigin(req)));
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(getOrigin(req) + config.auth.callbackUrl);
}

function getOrigin(req) {
  // Get the host from the headers
  const host = req.headers.get('host') || 'localhost:3000';
  
  // Determine the protocol
  const protocol = host.includes('localhost') ? 'http:' : 'http:';
  
  return `${protocol}//${host}`;
}
