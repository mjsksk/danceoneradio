import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNewsletter = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const subscribe = async (email: string) => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: { email }
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