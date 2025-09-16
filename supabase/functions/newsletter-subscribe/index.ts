import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SubscribeRequest = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
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

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active, unsubscribe_token")
      .eq("email", email)
      .maybeSingle();

    let unsubscribeToken = existingSubscriber?.unsubscribe_token;

    if (existingSubscriber) {
      if (existingSubscriber.is_active) {
        return new Response(
          JSON.stringify({ message: "Email is already subscribed to our newsletter" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } else {
        // Reactivate the subscription
        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({ is_active: true, subscribed_at: new Date().toISOString() })
          .eq("email", email);

        if (updateError) {
          console.error("Error reactivating subscription:", updateError);
          throw updateError;
        }
      }
    } else {
      // Insert new subscriber and get the unsubscribe token
      const { data: newSubscriber, error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({ email })
        .select("unsubscribe_token")
        .single();

      if (insertError) {
        console.error("Error inserting subscriber:", insertError);
        throw insertError;
      }
      
      unsubscribeToken = newSubscriber?.unsubscribe_token;
    }

    // Send welcome email using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    try {
      await resend.emails.send({
        from: "Dance One Radio <noreply@danceoneradio.com>",
        to: [email],
        subject: "Welcome to Dance One Radio Newsletter!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${req.headers.get('origin') || 'https://upbwlnpycrbhxahjztrf.supabase.co'}/lovable-uploads/ba6a92fa-e132-4643-8d4c-abc0bab124f1.png" alt="Dance One Radio Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;">
            </div>
            <h1 style="color: #333; text-align: center;">Welcome to Dance One Radio!</h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for subscribing to our newsletter! You're now part of the Dance One Radio family.
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You'll receive updates about:
            </p>
            
            <ul style="color: #666; font-size: 16px; line-height: 1.6;">
              <li>New shows and DJ sets</li>
              <li>Exclusive music releases</li>
              <li>Behind-the-scenes content</li>
              <li>Special events and announcements</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${req.headers.get('origin') || 'https://upbwlnpycrbhxahjztrf.supabase.co'}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Visit Dance One Radio
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              You can unsubscribe at any time by clicking 
              <a href="${req.headers.get('origin') || 'https://upbwlnpycrbhxahjztrf.supabase.co'}/unsubscribe?token=${unsubscribeToken}" style="color: #007bff;">here</a>.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail the subscription if email fails
    }

    console.log('New newsletter subscription', {
      timestamp: new Date().toISOString(),
      email: email.slice(0, 3) + '***' + email.slice(-10),
      userAgent: req.headers.get('user-agent')?.slice(0, 100),
      origin: req.headers.get('origin')
    });

    return new Response(
      JSON.stringify({ 
        message: "Successfully subscribed to newsletter! Check your email for confirmation." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in newsletter-subscribe function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to subscribe to newsletter" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);