import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, sanitizeEmail } from '@/utils/emailValidator';
import { contactFormLimiter } from '@/utils/rateLimiter';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const useContact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitContact = async (formData: ContactFormData) => {
    // Rate limiting check
    const clientId = 'contact_' + (navigator.userAgent + navigator.language).slice(0, 50);
    if (!contactFormLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(contactFormLimiter.getRemainingTime(clientId) / 1000);
      toast({
        title: "Too Many Requests",
        description: `Please wait ${remainingTime} seconds before trying again.`,
        variant: "destructive",
      });
      return false;
    }

    // Input validation
    if (!formData.name?.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.subject?.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.message?.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter your message.",
        variant: "destructive",
      });
      return false;
    }

    // Enhanced email validation
    const sanitizedEmail = sanitizeEmail(formData.email);
    const validation = validateEmail(sanitizedEmail);
    
    if (!validation.isValid) {
      toast({
        title: "Invalid Email",
        description: validation.error || "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    // Length validations
    if (formData.name.length > 100) {
      toast({
        title: "Name Too Long",
        description: "Name must be less than 100 characters.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.subject.length > 200) {
      toast({
        title: "Subject Too Long",
        description: "Subject must be less than 200 characters.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.message.length > 2000) {
      toast({
        title: "Message Too Long",
        description: "Message must be less than 2000 characters.",
        variant: "destructive",
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      const sanitizedData = {
        name: formData.name.trim(),
        email: sanitizedEmail,
        subject: formData.subject.trim(),
        message: formData.message.trim()
      };

      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: sanitizedData
      });

      if (error) {
        console.error('Contact form error:', error);
        throw error;
      }

      toast({
        title: "Message Sent Successfully! 📧",
        description: "Thank you for your message. We'll get back to you soon.",
      });

      return true;
    } catch (error: any) {
      console.error('Error sending contact message:', error);
      toast({
        title: "Failed to Send Message",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitContact,
    isSubmitting,
  };
};