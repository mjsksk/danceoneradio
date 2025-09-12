import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Helper function to sanitize HTML content
const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Input validation function
const validateInput = (data: ContactEmailRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  if (!data.subject || data.subject.trim().length === 0) {
    errors.push('Subject is required');
  }
  if (!data.message || data.message.trim().length === 0) {
    errors.push('Message is required');
  }
  
  // Check for suspicious patterns
  if (data.message.includes('<script') || data.message.includes('javascript:')) {
    errors.push('Message contains invalid content');
  }
  
  return { isValid: errors.length === 0, errors };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ContactEmailRequest = await req.json();
    
    // Validate input
    const validation = validateInput(requestData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.errors }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Sanitize all inputs
    const name = sanitizeHtml(requestData.name.trim());
    const email = requestData.email.trim(); // Email doesn't need HTML escaping but validate format
    const subject = sanitizeHtml(requestData.subject.trim());
    const message = sanitizeHtml(requestData.message.trim()).replace(/\n/g, '<br>');

    console.log(`Processing contact email from ${name} (${email})`);

    // Send confirmation email to the user
    const confirmationEmail = await resend.emails.send({
      from: "Dance One Radio <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank you for contacting us, ${name}!</h1>
          <p>We have received your message and will get back to you as soon as possible.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your message:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong><br>${message}</p>
          </div>
          
          <p>Best regards,<br>The Dance One Radio Team</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated confirmation email. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    // Send notification email to admin (using the same sender for demo)
    const adminEmail = await resend.emails.send({
      from: "Dance One Radio <onboarding@resend.dev>",
      to: [Deno.env.get("ADMIN_EMAIL")!], // Admin email from environment
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Contact Form Submission</h1>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong><br>${message}</p>
          </div>
          
          <p style="margin-top: 20px;">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
      replyTo: email,
    });

    console.log("Confirmation email sent:", confirmationEmail);
    console.log("Admin notification sent:", adminEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        confirmationId: confirmationEmail.data?.id,
        adminId: adminEmail.data?.id 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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