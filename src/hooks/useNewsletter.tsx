import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, sanitizeEmail } from '@/utils/emailValidator';
import { newsletterLimiter } from '@/utils/rateLimiter';

export const useNewsletter = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const subscribe = async (email: string) => {
    // Rate limiting check
    const clientId = 'newsletter_' + (navigator.userAgent + navigator.language).slice(0, 50);
    if (!newsletterLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(newsletterLimiter.getRemainingTime(clientId) / 1000);
      toast({
        title: "Too Many Requests",
        description: `Please wait ${remainingTime} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }

    // Enhanced email validation
    const sanitizedEmail = sanitizeEmail(email);
    const validation = validateEmail(sanitizedEmail);
    
    if (!validation.isValid) {
      toast({
        title: "Invalid Email",
        description: validation.error || "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: { email: sanitizedEmail }
      });

      if (error) {
        console.error('Newsletter subscription error:', error);
        throw error;
      }

      toast({
        title: "Successfully Subscribed! 🎵",
        description: "Thank you for subscribing to our newsletter. Check your email for confirmation.",
      });

      return true;
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to subscribe to newsletter. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    subscribe,
    isSubmitting,
  };
};