import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// Resend is imported dynamically inside sendEmail to avoid cold start time
// import { Resend } from "npm:resend@2.0.0";

// Secrets (lightweight reads only)
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Curately <noreply@resend.dev>";

// CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Payload type sent by Supabase Auth hook
interface AuthHookPayload {
  user: { email: string };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: "signup" | "recovery" | "magic_link" | string;
    site_url: string;
  };
}

function buildEmail(payload: AuthHookPayload) {
  const { email_data } = payload;
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

  const url = new URL(`${SUPABASE_URL}/auth/v1/verify`);
  url.searchParams.set("token", email_data.token_hash);
  url.searchParams.set("type", email_data.email_action_type);
  url.searchParams.set("redirect_to", email_data.redirect_to);
  if (ANON_KEY) url.searchParams.set("apikey", ANON_KEY);
  const confirmUrl = url.toString();

  let subject = "Curately - Authentication";
  let html = "";

  switch (email_data.email_action_type) {
    case "signup":
      subject = "🎉 Confirm your email - Curately";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Curately</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #3B4A6A 0%, #556B8D 50%, #FF6F61 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px -10px rgba(59, 74, 106, 0.3);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3B4A6A 0%, #556B8D 100%); padding: 40px 30px; text-align: center;">
              <div style="background: #ffffff; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px; font-weight: bold; color: #3B4A6A;">C</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Curately! 🎉</h1>
              <p style="color: #E2E8F0; margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your digital curation journey begins here</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1A202C; margin: 0 0 20px; font-size: 20px; font-weight: 600;">Thank you for joining us!</h2>
              <p style="color: #4A5568; margin: 0 0 30px; font-size: 16px; line-height: 1.6;">
                We're excited to have you as part of the Curately community. To get started and unlock all features, please confirm your email address by clicking the button below.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${confirmUrl}" 
                   style="background: linear-gradient(135deg, #FF6F61, #FF8A80); 
                          color: #ffffff; 
                          padding: 16px 32px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block; 
                          font-weight: 600; 
                          font-size: 16px; 
                          box-shadow: 0 4px 15px rgba(255, 111, 97, 0.3);">
                  ✨ Confirm Email & Start Curating
                </a>
              </div>
              
              <!-- Backup Link -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #E2E8F0;">
                <p style="color: #718096; font-size: 14px; margin: 0 0 10px;">Having trouble with the button? Copy and paste this link:</p>
                <p style="color: #3B4A6A; font-size: 14px; word-break: break-all; background: #F7F8FA; padding: 10px; border-radius: 4px;">${confirmUrl}</p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #F7F8FA; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 14px; margin: 0 0 15px;">
                If you didn't create an account with Curately, you can safely ignore this email.
              </p>
              <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Curately. Made with ❤️ for digital curators.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
      break;
    case "recovery":
      subject = "🔐 Reset your password - Curately";
      html = `
        <div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; max-width: 640px; margin: 0 auto;">
          <h1 style="color:#0f172a;">Reset Your Password</h1>
          <p>Click the link below to reset your password:</p>
          <p><a href="${confirmUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Reset Password</a></p>
          <p style="color:#475569;font-size:12px">If the button doesn't work, copy this URL:<br/>${confirmUrl}</p>
        </div>
      `;
      break;
    case "magic_link":
      subject = "✨ Your magic sign-in link - Curately";
      html = `
        <div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; max-width: 640px; margin: 0 auto;">
          <h1 style="color:#0f172a;">Sign In to Curately</h1>
          <p>Click the link below to sign in to your account:</p>
          <p><a href="${confirmUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Sign In</a></p>
          <p style="color:#475569;font-size:12px">If the button doesn't work, copy this URL:<br/>${confirmUrl}</p>
        </div>
      `;
      break;
    default:
      html = `
        <div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; max-width: 640px; margin: 0 auto;">
          <h1 style="color:#0f172a;">Curately</h1>
          <p>Continue by clicking the link below:</p>
          <p><a href="${confirmUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Continue</a></p>
          <p style="color:#475569;font-size:12px">If the button doesn't work, copy this URL:<br/>${confirmUrl}</p>
        </div>
      `;
  }

  return { subject, html };
}

async function sendEmail(payload: AuthHookPayload) {
  const { user } = payload;
  const { subject, html } = buildEmail(payload);

  // Dynamic import to avoid cold start costs before responding to hook
  const { Resend } = await import("npm:resend@2.0.0");
  const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

  const res = await resend.emails.send({
    from: FROM_EMAIL,
    to: [user.email],
    subject,
    html,
  });
  console.log("Auth email dispatched:", res);
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Parse JSON payload (Supabase Auth hook POSTs JSON)
    const payload = (await req.json()) as AuthHookPayload;
    console.log("Auth hook received:", payload?.email_data?.email_action_type, payload?.user?.email);

    // Start email send in background to avoid 5s hook timeout
    try {
      // Prefer background task if available
      // @ts-ignore - EdgeRuntime is available in Supabase edge runtime
      if (globalThis.EdgeRuntime?.waitUntil) {
        // @ts-ignore
        EdgeRuntime.waitUntil(sendEmail(payload));
      } else {
        // Fallback: fire-and-forget (best effort)
        sendEmail(payload);
      }
    } catch (bgErr) {
      console.error("Failed to schedule background task:", bgErr);
    }

    // Respond immediately so GoTrue hook doesn't time out
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-auth-email error:", error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
