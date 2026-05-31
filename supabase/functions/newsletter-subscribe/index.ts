import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// Resend via direct fetch (avoids npm: import issues in Deno edge runtime)
const sendResendEmail = async (apiKey: string, payload: Record<string, unknown>) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error ${res.status}: ${text}`);
  }
  return res.json();
};
import { checkRateLimit, getClientIdentifier } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
}

// Helper to parse user agent into readable browser/OS info
const parseUserAgent = (ua: string | null): { browser: string; os: string; device: string } => {
  if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };
  
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Detect browser
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Opera/') || ua.includes('OPR/')) browser = 'Opera';

  // Detect OS
  if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
  else if (ua.includes('Windows NT')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Detect device type
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) device = 'Mobile';
  else if (ua.includes('iPad') || ua.includes('Tablet')) device = 'Tablet';

  return { browser, os, device };
};

// Fetch geolocation from IP using free API
const getGeoLocation = async (ip: string): Promise<{ country: string; city: string; region: string }> => {
  try {
    // Skip localhost/private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'Local', city: 'Development', region: '' };
    }
    
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return { 
        country: data.country || 'Unknown', 
        city: data.city || 'Unknown', 
        region: data.regionName || '' 
      };
    }
  } catch (e) {
    console.error('Geolocation lookup failed:', e);
  }
  return { country: 'Unknown', city: 'Unknown', region: '' };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SubscribeRequest = await req.json();
    
    // Extract visitor info early
    const userAgent = req.headers.get('user-agent') || '';
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-real-ip') || 
                     'Unknown';
    const referer = req.headers.get('referer') || 'Direct';
    const { browser, os, device } = parseUserAgent(userAgent);

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

    // Server-side rate limiting - use email as identifier for newsletter
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimit(
      supabase,
      {
        endpoint: 'newsletter-subscribe',
        maxRequests: 2,
        windowMs: 300000 // 5 minutes
      },
      `${clientId}:${email}`, // Combine IP and email for more granular control
      req.headers.get('user-agent') || undefined
    );

    if (!rateLimitResult.allowed) {
      console.warn('Newsletter rate limit exceeded', { 
        clientId, 
        email: email.substring(0, 3) + '***',
        timestamp: new Date().toISOString() 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Too many subscription attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter 
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitResult.retryAfter || 300),
            ...corsHeaders 
          },
        }
      );
    }

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
        // Reactivate the subscription with updated location info
        const geoLocation = await getGeoLocation(clientIp);
        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({ 
            is_active: true, 
            subscribed_at: new Date().toISOString(),
            ip_address: clientIp,
            country: geoLocation.country,
            city: geoLocation.city,
            region: geoLocation.region,
            browser,
            os,
            device_type: device
          })
          .eq("email", email);

        if (updateError) {
          console.error("Error reactivating subscription:", updateError);
          throw updateError;
        }
      }
    } else {
      // Get geolocation for new subscriber
      const geoLocation = await getGeoLocation(clientIp);
      
      // Insert new subscriber with location info
      const { data: newSubscriber, error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({ 
          email,
          ip_address: clientIp,
          country: geoLocation.country,
          city: geoLocation.city,
          region: geoLocation.region,
          browser,
          os,
          device_type: device
        })
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
      // Send welcome email to subscriber
      await resend.emails.send({
        from: "Dance One Radio <noreply@danceoneradio.com>",
        to: [email],
        subject: "Welcome to Dance One Radio Newsletter!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://danceoneradio.com/lovable-uploads/ba6a92fa-e132-4643-8d4c-abc0bab124f1.png" alt="Dance One Radio Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;">
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
              <a href="https://danceoneradio.com" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Visit Dance One Radio
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              You can unsubscribe at any time by clicking 
              <a href="https://danceoneradio.com/unsubscribe?token=${unsubscribeToken}" style="color: #007bff;">here</a>.
            </p>
          </div>
        `,
      });

      // Get geolocation for admin notification
      const geoLocation = await getGeoLocation(clientIp);
      const locationString = geoLocation.city !== 'Unknown' 
        ? `${geoLocation.city}${geoLocation.region ? ', ' + geoLocation.region : ''}, ${geoLocation.country}`
        : geoLocation.country;

      // Send notification email to admin (minimal PII to protect subscriber privacy)
      await resend.emails.send({
        from: "Dance One Radio <noreply@danceoneradio.com>",
        to: ["mario.rybansky@gmail.com"],
        subject: "🎵 New Newsletter Subscriber!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">New Newsletter Subscriber</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              A new visitor has subscribed to the Dance One Radio newsletter:
            </p>
            
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">📧 Subscriber Info</h3>
              <p style="margin: 0 0 8px 0; color: #333; font-size: 16px;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0; color: #666; font-size: 14px;"><strong>Subscribed at:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC</p>
            </div>
            
            <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #cce5f7; padding-bottom: 10px;">🌍 Region</h3>
              <p style="margin: 0; color: #333; font-size: 14px;"><strong>Country:</strong> ${geoLocation.country}</p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated notification from Dance One Radio.<br/>
              For detailed subscriber analytics, view the admin dashboard.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
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