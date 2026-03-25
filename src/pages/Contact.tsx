import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import SocialShare from '@/components/SocialShare';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!consentGiven) {
      toast({
        title: "Consent Required",
        description: "Please agree to the data storage consent before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const trackLink = formData.get('trackLink') as string;
    const artistName = formData.get('subject') as string;
    const contactData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: `Demo Submission: ${artistName}`,
      message: `Artist Name: ${artistName}\nTrack Link: ${trackLink}\n\n${formData.get('message') as string}`,
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

      // If newsletter opt-in, subscribe them
      if (newsletterOptIn) {
        try {
          await supabase.functions.invoke('newsletter-subscribe', {
            body: { email: contactData.email.trim().toLowerCase() }
          });
        } catch (nlError) {
          console.error('Newsletter subscription error:', nlError);
          // Don't block the contact form submission
        }
      }

      // Send emails via edge function (include consent info)
      const emailResponse = await supabase.functions.invoke('send-contact-email', {
        body: {
          ...contactData,
          consentGiven: true,
          newsletterOptIn,
        }
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
        setNewsletterOptIn(false);
        setConsentGiven(false);
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
          
          <GoogleAds key="contact-ad" slot={AD_SLOTS.SIDEBAR} />

          {/* Advertise CTA */}
          <div className="mb-8 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-background to-accent/10 p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">Looking to Advertise or Partner?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore our advertising, sponsorship, and editorial partnership opportunities.
            </p>
            <Link to="/advertise">
              <Button variant="outline" className="mt-4 border-primary/50 hover:bg-primary/10">
                View Advertising Opportunities
              </Button>
            </Link>
          </div>
          
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
            
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Send us your promo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Your Real Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your real name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email <span className="text-destructive">*</span>
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
                  Artist Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Your artist / DJ name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="trackLink" className="block text-sm font-medium text-foreground mb-2">
                  Link to Download Your Track(s) <span className="text-destructive">*</span>
                </label>
                <Input
                  id="trackLink"
                  name="trackLink"
                  type="url"
                  placeholder="https://soundcloud.com/... or https://drive.google.com/..."
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Why Do You Feel Your Music Is Playable on Our Station? <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us why your music fits Dance One Radio..."
                  rows={5}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Newsletter Opt-in */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="newsletter"
                  checked={newsletterOptIn}
                  onCheckedChange={(checked) => setNewsletterOptIn(checked === true)}
                  disabled={isSubmitting}
                />
                <label htmlFor="newsletter" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                  Sign me up for the Dance One Radio newsletter to receive updates, news, and exclusive content.
                </label>
              </div>

              {/* Data Consent */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked === true)}
                  disabled={isSubmitting}
                  required
                />
                <label htmlFor="consent" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                  I consent to having this website store my submitted information so they can respond to my inquiry. The submitted information will only be used for the purpose of contacting you and follow-up. <span className="text-destructive">*</span>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || !consentGiven}>
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