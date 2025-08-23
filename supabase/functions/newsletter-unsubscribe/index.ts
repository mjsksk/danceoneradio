import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unsubscribe token is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

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

    if (!subscriber) {
      return new Response(
        JSON.stringify({ error: "Invalid unsubscribe token" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!subscriber.is_active) {
      return new Response(
        JSON.stringify({ message: "Email is already unsubscribed" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
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

    console.log(`✅ Unsubscribed: ${subscriber.email}`);

    // Return HTML response for better user experience
    const htmlResponse = `
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
          <h1>Successfully Unsubscribed</h1>
          <p class="success">You have been successfully unsubscribed from Dance One Radio newsletter.</p>
          <p>We're sorry to see you go! If you change your mind, you can always subscribe again on our website.</p>
          <a href="https://your-domain.com" class="button">Visit Dance One Radio</a>
        </div>
      </body>
      </html>
    `;

    return new Response(htmlResponse, {
      status: 200,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in newsletter-unsubscribe function:", error);
    
    const errorHtml = `
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
          <p>We encountered an error while processing your unsubscribe request. Please try again later or contact support.</p>
        </div>
      </body>
      </html>
    `;

    return new Response(errorHtml, {
      status: 500,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }
};

serve(handler);