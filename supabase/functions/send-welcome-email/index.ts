import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  username?: string;
  displayName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received welcome email request");
    
    const { email, username, displayName }: WelcomeEmailRequest = await req.json();
    const name = displayName || username || email.split('@')[0];
    
    console.log("Sending welcome email to:", email, "Name:", name);

    const fromEmail = Deno.env.get("FROM_EMAIL") || "Curately <noreply@resend.dev>";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Curately - Let's Get Started!</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #3B4A6A 0%, #556B8D 50%, #FF6F61 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px -10px rgba(59, 74, 106, 0.3);">
          <!-- Hero Header -->
          <div style="background: linear-gradient(135deg, #3B4A6A 0%, #556B8D 100%); padding: 50px 30px; text-align: center; position: relative;">
            <div style="background: #ffffff; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
              <span style="font-size: 32px; font-weight: bold; color: #3B4A6A;">C</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Welcome aboard, ${name}! 🎉</h1>
            <p style="color: #E2E8F0; margin: 15px 0 0; font-size: 18px; opacity: 0.95; font-weight: 300;">Your curation adventure starts now</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 50px 40px;">
            <h2 style="color: #1A202C; margin: 0 0 25px; font-size: 24px; font-weight: 600; text-align: center;">🚀 You're all set up!</h2>
            <p style="color: #4A5568; margin: 0 0 35px; font-size: 16px; line-height: 1.7; text-align: center;">
              Thank you for joining Curately! We're thrilled to have you in our community of digital curators. Here's what you can do next:
            </p>
            
            <!-- Feature Cards -->
            <div style="margin: 40px 0;">
              <div style="background: linear-gradient(145deg, #F7F8FA, #FFFFFF); border-radius: 12px; padding: 30px; margin-bottom: 20px; border: 1px solid #E2E8F0; box-shadow: 0 2px 10px rgba(59, 74, 106, 0.05);">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="background: linear-gradient(135deg, #FF6F61, #FF8A80); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="font-size: 20px;">📚</span>
                  </div>
                  <h3 style="color: #3B4A6A; margin: 0; font-size: 18px; font-weight: 600;">Create Your First Collection</h3>
                </div>
                <p style="color: #4A5568; margin: 0; font-size: 14px; line-height: 1.5;">
                  Start curating by creating your first collection. Whether it's books, articles, movies, or anything else - organize your digital discoveries!
                </p>
              </div>
              
              <div style="background: linear-gradient(145deg, #F7F8FA, #FFFFFF); border-radius: 12px; padding: 30px; margin-bottom: 20px; border: 1px solid #E2E8F0; box-shadow: 0 2px 10px rgba(59, 74, 106, 0.05);">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="background: linear-gradient(135deg, #3B4A6A, #556B8D); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="font-size: 20px;">🎯</span>
                  </div>
                  <h3 style="color: #3B4A6A; margin: 0; font-size: 18px; font-weight: 600;">Share Recommendations</h3>
                </div>
                <p style="color: #4A5568; margin: 0; font-size: 14px; line-height: 1.5;">
                  Share your curated recommendations with friends and discover amazing content from fellow curators in the community.
                </p>
              </div>
              
              <div style="background: linear-gradient(145deg, #F7F8FA, #FFFFFF); border-radius: 12px; padding: 30px; border: 1px solid #E2E8F0; box-shadow: 0 2px 10px rgba(59, 74, 106, 0.05);">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="background: linear-gradient(135deg, #38A169, #48BB78); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="font-size: 20px;">🤝</span>
                  </div>
                  <h3 style="color: #3B4A6A; margin: 0; font-size: 18px; font-weight: 600;">Connect & Discover</h3>
                </div>
                <p style="color: #4A5568; margin: 0; font-size: 14px; line-height: 1.5;">
                  Follow other curators, explore trending collections, and get personalized recommendations based on your interests.
                </p>
              </div>
            </div>
            
            <!-- Pro Tips -->
            <div style="background: linear-gradient(135deg, #F0FFF4, #E6FFFA); border-left: 4px solid #38A169; padding: 25px; margin: 40px 0; border-radius: 8px;">
              <h3 style="color: #2F855A; margin: 0 0 15px; font-size: 18px; font-weight: 600;">💡 Pro Tips to Get Started</h3>
              <ul style="color: #2F855A; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                <li style="margin-bottom: 8px;">Use descriptive titles and tags for better organization</li>
                <li style="margin-bottom: 8px;">Add personal notes to remember why you saved something</li>
                <li style="margin-bottom: 8px;">Explore the public collections for inspiration</li>
                <li>Share your profile link with friends to grow your network</li>
              </ul>
            </div>
            
            <!-- Community -->
            <div style="text-align: center; padding: 30px; background: #F7F8FA; border-radius: 12px; margin-top: 40px;">
              <h3 style="color: #3B4A6A; margin: 0 0 15px; font-size: 20px; font-weight: 600;">Join Our Community 🌟</h3>
              <p style="color: #4A5568; margin: 0 0 20px; font-size: 16px;">
                Connect with fellow curators and stay updated with the latest features
              </p>
              <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                <span style="background: #3B4A6A; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">📧 Email Updates</span>
                <span style="background: #FF6F61; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">💬 Community</span>
                <span style="background: #38A169; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">📱 Mobile App</span>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: linear-gradient(135deg, #F7F8FA, #E2E8F0); padding: 40px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #718096; font-size: 16px; margin: 0 0 10px; font-weight: 500;">
              Need help getting started? We're here for you! 💌
            </p>
            <p style="color: #A0AEC0; font-size: 14px; margin: 0 0 20px;">
              Reply to this email with any questions - our team loves helping new curators!
            </p>
            <div style="height: 1px; background: linear-gradient(90deg, transparent, #E2E8F0, transparent); margin: 25px 0;"></div>
            <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Curately. Made with ❤️ for digital curators worldwide.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "🎉 Welcome to Curately - Let's start curating!",
      html: htmlContent,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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