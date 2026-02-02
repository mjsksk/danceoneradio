import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting constants
const MAX_ATTEMPTS_PER_HOUR = 10;
const RATE_LIMIT_WINDOW_HOURS = 1;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client IP for rate limiting
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("x-real-ip") || 
                   "unknown";

  // Initialize Supabase client with service role for rate limiting
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    // Validate token format (must be a valid UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!token || !uuidRegex.test(token)) {
      console.log(`Invalid token format from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Invalid unsubscribe token format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check rate limit before processing
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    const { count: attemptCount, error: countError } = await supabase
      .from("unsubscribe_attempts")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", clientIP)
      .gte("attempted_at", oneHourAgo);

    if (countError) {
      console.error("Error checking rate limit:", countError);
    }

    if (attemptCount !== null && attemptCount >= MAX_ATTEMPTS_PER_HOUR) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many unsubscribe attempts. Please try again later." }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": "3600",
            ...corsHeaders 
          },
        }
      );
    }

    // Log the attempt
    await supabase.from("unsubscribe_attempts").insert({
      ip_address: clientIP,
      success: false, // Will update on success
    });

    // Find subscriber by unsubscribe token
    const { data: subscriber, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, is_active")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching subscriber:", fetchError);
      throw fetchError;
    }

    // Use generic message to prevent token enumeration
    if (!subscriber) {
      console.log(`Unsubscribe attempt with invalid token from IP: ${clientIP}`);
      // Return success-like response to prevent token enumeration
      return new Response(
        generateSuccessHtml("If this email was subscribed, it has been unsubscribed."),
        {
          status: 200,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    if (!subscriber.is_active) {
      return new Response(
        generateSuccessHtml("This email is already unsubscribed."),
        {
          status: 200,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Deactivate the subscription
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({ is_active: false })
      .eq("unsubscribe_token", token);

    if (updateError) {
      console.error("Error unsubscribing:", updateError);
      throw updateError;
    }

    // Update attempt as successful (mask email in logs)
    const maskedEmail = subscriber.email.replace(/(.{2}).*@/, "$1***@");
    console.log(`✅ Unsubscribed: ${maskedEmail}`);

    return new Response(
      generateSuccessHtml("You have been successfully unsubscribed from Dance One Radio newsletter."),
      {
        status: 200,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in newsletter-unsubscribe function:", error.message || "Unknown error");
    
    return new Response(
      generateErrorHtml(),
      {
        status: 500,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  }
};

function generateSuccessHtml(message: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unsubscribed - Dance One Radio</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          text-align: center;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; font-size: 16px; line-height: 1.6; }
        .success { color: #28a745; font-weight: bold; }
        .button {
          background-color: #007bff;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Unsubscribe Request Processed</h1>
        <p class="success">${message}</p>
        <p>We're sorry to see you go! If you change your mind, you can always subscribe again on our website.</p>
        <a href="https://danceoneradio.lovable.app" class="button">Visit Dance One Radio</a>
      </div>
    </body>
    </html>
  `;
}

function generateErrorHtml(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error - Dance One Radio</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          text-align: center;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #dc3545; margin-bottom: 20px; }
        p { color: #666; font-size: 16px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Oops! Something went wrong</h1>
        <p>We encountered an error while processing your request. Please try again later.</p>
      </div>
    </body>
    </html>
  `;
}

serve(handler);
