import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

interface UsernameCheckRequest {
  username: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
    });
  }

  try {
    const { username }: UsernameCheckRequest = await req.json();

    if (!username || username.length < 3) {
      return new Response(JSON.stringify({ 
        available: false, 
        message: 'Username must be at least 3 characters long' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
      });
    }

    // Check for invalid characters (only allow alphanumeric, underscore, hyphen)
    const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validUsernameRegex.test(username)) {
      return new Response(JSON.stringify({ 
        available: false, 
        message: 'Username can only contain letters, numbers, underscores, and hyphens' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
      });
    }

    // Use secure database function to check username availability
    // This doesn't expose email addresses or other sensitive data
    const { data: isAvailable, error } = await supabase
      .rpc('is_username_available', {
        check_username: username.toLowerCase()
      });

    if (error) {
      console.error('Error checking username:', error);
      return new Response(JSON.stringify({ 
        available: false, 
        message: 'Error checking username availability' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
      });
    }

    const message = isAvailable ? 'Username is available' : 'Username is already taken';

    return new Response(JSON.stringify({ available: isAvailable, message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in check-username function:', error);
    return new Response(JSON.stringify({ 
      available: false, 
      message: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
    });
  }
};

serve(handler);