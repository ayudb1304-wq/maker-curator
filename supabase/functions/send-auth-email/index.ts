import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received auth email request");
    
    const payload: AuthEmailRequest = await req.json();
    const { user, email_data } = payload;
    
    console.log("Processing email for:", user.email, "Type:", email_data.email_action_type);

    let subject = "Curately - Authentication";
    let htmlContent = "";
    
    const confirmUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;

    switch (email_data.email_action_type) {
      case "signup":
        subject = "Welcome to Curately - Confirm your email";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Welcome to Curately!</h1>
            <p>Thank you for signing up. Please confirm your email address to get started.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Confirm Your Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">${confirmUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't create an account with Curately, you can safely ignore this email.</p>
          </div>
        `;
        break;
        
      case "recovery":
        subject = "Curately - Reset your password";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
            <p>You requested to reset your password for your Curately account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">${confirmUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        `;
        break;
        
      case "magic_link":
        subject = "Curately - Sign in with magic link";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Sign in to Curately</h1>
            <p>Click the link below to sign in to your account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Sign In
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">${confirmUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't request this sign-in link, you can safely ignore this email.</p>
          </div>
        `;
        break;
        
      default:
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Curately</h1>
            <p>Please click the link below to continue:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Continue
              </a>
            </div>
          </div>
        `;
    }

    const emailResponse = await resend.emails.send({
      from: "Curately <noreply@resend.dev>",
      to: [user.email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);