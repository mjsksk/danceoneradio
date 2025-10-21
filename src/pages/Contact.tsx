import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import AdSenseUnit from '@/components/AdSenseUnit';
import SocialShare from '@/components/SocialShare';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const contactData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      created_at: new Date().toISOString()
    };

    try {
      // Store in Supabase database
      const { error } = await supabase
        .from('contact_messages')
        .insert([contactData]);

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Send emails via edge function
      const emailResponse = await supabase.functions.invoke('send-contact-email', {
        body: contactData
      });

      if (emailResponse.error) {
        console.error('Email error:', emailResponse.error);
        toast({
          title: "Message saved but email failed",
          description: "Your message was saved but we couldn't send the confirmation email.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Message sent!",
          description: "We've received your message and sent you a confirmation email.",
        });
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Contact Dance One Radio - Get in Touch"
        description="Contact Dance One Radio for inquiries, partnerships, DJ bookings, or to submit your music. We would love to hear from you."
        keywords="contact dance one radio, DJ booking, music submission, radio contact, demo submission"
      />
      <Navigation />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 text-foreground">Contact Us</h1>
          <div className="flex justify-center mb-8">
            <SocialShare 
              url={window.location.href}
              title="Contact Dance One Radio"
              description="Contact Dance One Radio for inquiries, partnerships, DJ bookings, or to submit your music. We would love to hear from you."
              image={`${window.location.origin}/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png`}
            />
          </div>
          
          <AdSenseUnit key="contact-ad" />
          
          {/* Contact Form */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
            {/* Demo Submission Guidelines */}
            <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-base text-foreground leading-relaxed">
                We love listening to new music, but please keep in mind that we are
                looking for music that can be played on our station.
                We are looking for projects that possess superior quality
                and are supported by artists who are serious about their
                careers and the dance community as a whole.
              </p>
              <p className="text-base text-foreground leading-relaxed mt-3">
                After we've reviewed your materials, we can then fill you in on
                more of the particulars of how our networks might be able to assist you.
                To send us your demo contact us via email for further instructions.
              </p>
              <p className="text-base text-foreground leading-relaxed mt-3 font-medium">
                Thanks for your interest in us.
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="What's this about?"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more..."
                  rows={5}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;