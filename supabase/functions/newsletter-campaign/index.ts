import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  subject: string;
  content: string;
  sent_by?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, content, sent_by }: CampaignRequest = await req.json();

    if (!subject || !content) {
      return new Response(
        JSON.stringify({ error: "Subject and content are required" }),
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

    // Get all active subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("email, unsubscribe_token")
      .eq("is_active", true);

    if (fetchError) {
      console.error("Error fetching subscribers:", fetchError);
      throw fetchError;
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      const unsubscribeUrl = `https://your-domain.com/unsubscribe?token=${subscriber.unsubscribe_token}`;
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333;">Dance One Radio Newsletter</h1>
          </div>
          
          <div style="color: #666; font-size: 16px; line-height: 1.6;">
            ${content}
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <div style="text-align: center;">
            <a href="https://your-domain.com" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-bottom: 20px;">
              Visit Dance One Radio
            </a>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            You're receiving this because you subscribed to Dance One Radio newsletter.<br>
            <a href="${unsubscribeUrl}" style="color: #007bff;">Unsubscribe</a> | 
            <a href="https://your-domain.com" style="color: #007bff;">Visit our website</a>
          </p>
        </div>
      `;

      try {
        await resend.emails.send({
          from: "Dance One Radio <noreply@resend.dev>",
          to: [subscriber.email],
          subject: subject,
          html: emailContent,
        });
        return { email: subscriber.email, status: "sent" };
      } catch (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error);
        return { email: subscriber.email, status: "failed", error: error.message };
      }
    });

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(result => 
      result.status === "fulfilled" && result.value.status === "sent"
    ).length;

    // Save campaign to database
    const { error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .insert({
        subject,
        content,
        sent_by: sent_by || "system",
        recipient_count: successCount,
      });

    if (campaignError) {
      console.error("Error saving campaign:", campaignError);
    }

    console.log(`✅ Newsletter campaign sent to ${successCount}/${subscribers.length} subscribers`);

    return new Response(
      JSON.stringify({ 
        message: `Newsletter sent successfully to ${successCount} out of ${subscribers.length} subscribers`,
        sent_count: successCount,
        total_subscribers: subscribers.length,
        results: results.map(result => 
          result.status === "fulfilled" ? result.value : { status: "failed" }
        )
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in newsletter-campaign function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send newsletter campaign" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);