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
  try {
    console.log("Received auth hook request");
    
    // Get the raw payload and headers for webhook verification
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Verify webhook signature if secret is configured
    if (hookSecret) {
      const wh = new Webhook(hookSecret);
      const { user, email_data } = wh.verify(payload, headers) as AuthHookPayload;
      
      console.log("Processing email for:", user.email, "Type:", email_data.email_action_type);
      
      await sendEmail(user, email_data);
    } else {
      // Fallback for development - parse JSON directly
      console.warn("No SEND_EMAIL_HOOK_SECRET configured, using fallback mode");
      const { user, email_data } = JSON.parse(payload) as AuthHookPayload;
      
      console.log("Processing email for:", user.email, "Type:", email_data.email_action_type);
      
      await sendEmail(user, email_data);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email hook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

  let subject = "Curately - Authentication";
  let htmlContent = "";
  
  const confirmUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;

    switch (email_data.email_action_type) {
      case "signup":
        subject = "🎉 Welcome to Curately - Confirm your email";
        htmlContent = `
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
                            box-shadow: 0 4px 15px rgba(255, 111, 97, 0.3);
                            transition: all 0.3s ease;">
                    ✨ Confirm Your Email
                  </a>
                </div>
                
                <!-- Features Preview -->
                <div style="background: #F7F8FA; border-radius: 8px; padding: 25px; margin: 30px 0;">
                  <h3 style="color: #3B4A6A; margin: 0 0 15px; font-size: 18px; font-weight: 600;">What's waiting for you:</h3>
                  <ul style="color: #4A5568; margin: 0; padding-left: 0; list-style: none;">
                    <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
                      <span style="position: absolute; left: 0; color: #FF6F61;">📚</span>
                      Curate and organize your digital collections
                    </li>
                    <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
                      <span style="position: absolute; left: 0; color: #FF6F61;">🤝</span>
                      Share recommendations with friends
                    </li>
                    <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
                      <span style="position: absolute; left: 0; color: #FF6F61;">🎯</span>
                      Get personalized content suggestions
                    </li>
                    <li style="padding-left: 25px; position: relative;">
                      <span style="position: absolute; left: 0; color: #FF6F61;">✨</span>
                      Connect with like-minded curators
                    </li>
                  </ul>
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
        subject = "🔐 Reset your Curately password";
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - Curately</title>
          </head>
          <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #3B4A6A 0%, #556B8D 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
            <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px -10px rgba(59, 74, 106, 0.3);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #3B4A6A 0%, #556B8D 100%); padding: 40px 30px; text-align: center;">
                <div style="background: #ffffff; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 24px; font-weight: bold; color: #3B4A6A;">C</span>
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request 🔐</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <p style="color: #4A5568; margin: 0 0 30px; font-size: 16px; line-height: 1.6;">
                  We received a request to reset your password for your Curately account. Click the button below to set a new password.
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${confirmUrl}" 
                     style="background: linear-gradient(135deg, #3B4A6A, #556B8D); 
                            color: #ffffff; 
                            padding: 16px 32px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            display: inline-block; 
                            font-weight: 600; 
                            font-size: 16px; 
                            box-shadow: 0 4px 15px rgba(59, 74, 106, 0.3);">
                    🔑 Reset Password
                  </a>
                </div>
                
                <!-- Security Notice -->
                <div style="background: #FFF5F5; border-left: 4px solid #FF6F61; padding: 20px; margin: 30px 0; border-radius: 4px;">
                  <h3 style="color: #C53030; margin: 0 0 10px; font-size: 16px; font-weight: 600;">🛡️ Security Notice</h3>
                  <p style="color: #742A2A; margin: 0; font-size: 14px;">
                    This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email or contact our support team.
                  </p>
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
                  If you didn't request a password reset, you can safely ignore this email.
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
        
      case "magic_link":
        subject = "✨ Your Curately magic link";
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign in to Curately</title>
          </head>
          <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #3B4A6A 0%, #556B8D 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
            <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px -10px rgba(59, 74, 106, 0.3);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #3B4A6A 0%, #556B8D 100%); padding: 40px 30px; text-align: center;">
                <div style="background: #ffffff; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 24px; font-weight: bold; color: #3B4A6A;">C</span>
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Sign in to Curately ✨</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <p style="color: #4A5568; margin: 0 0 30px; font-size: 16px; line-height: 1.6;">
                  Welcome back! Click the button below to securely sign in to your Curately account.
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
                    🚀 Sign In Now
                  </a>
                </div>
                
                <!-- Quick tip -->
                <div style="background: #F0FFF4; border-left: 4px solid #38A169; padding: 20px; margin: 30px 0; border-radius: 4px;">
                  <p style="color: #2F855A; margin: 0; font-size: 14px;">
                    💡 <strong>Pro tip:</strong> Bookmark this page after signing in for quick access to your curated collections!
                  </p>
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
                  If you didn't request this sign-in link, you can safely ignore this email.
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
serve(handler);

    const fromEmail = Deno.env.get("FROM_EMAIL") || "Curately <noreply@resend.dev>";

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [user.email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw error;
  }
}

serve(handler);