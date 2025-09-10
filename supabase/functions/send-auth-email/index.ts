import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Secrets
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
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
  const confirmUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;

  let subject = "Curately - Authentication";
  let html = `
    <div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; max-width: 640px; margin: 0 auto;">
      <h1 style="color:#0f172a;">Curately</h1>
      <p>Continue by clicking the link below:</p>
      <p><a href="${confirmUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Continue</a></p>
      <p style="color:#475569;font-size:12px">If the button doesn't work, copy this URL:<br/>${confirmUrl}</p>
    </div>
  `;

  switch (email_data.email_action_type) {
    case "signup":
      subject = "Confirm your email - Curately";
      break;
    case "recovery":
      subject = "Reset your password - Curately";
      break;
    case "magic_link":
      subject = "Your magic sign-in link - Curately";
      break;
  }

  return { subject, html };
}

async function sendEmail(payload: AuthHookPayload) {
  const { user } = payload;
  const { subject, html } = buildEmail(payload);

  const res = await resend.emails.send({
    from: FROM_EMAIL,
    to: [user.email],
    subject,
    html,
  });
  console.log("Email sent successfully:", res);
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
