import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Radio, Headphones, Globe, Mic2, Music, Megaphone, ArrowLeft } from 'lucide-react';

const opportunities = [
  {
    icon: Megaphone,
    title: 'On-Air Spots',
    description: 'Professionally produced 15, 30, or 60-second audio spots aired as pre-roll or mid-roll during live broadcasts and podcast episodes.',
  },
  {
    icon: Mic2,
    title: 'Artist & Label Features',
    description: 'Dedicated airtime segments spotlighting your latest release, remix, or EP with DJ-curated intros and custom branding.',
  },
  {
    icon: Globe,
    title: 'Digital & Banner Ads',
    description: 'High-visibility placements across our website, apps, and newsletter reaching thousands of engaged electronic music fans.',
  },
  {
    icon: Music,
    title: 'Show Sponsorship',
    description: 'Align your brand with one of our weekly shows. Includes branded intro/outro, social media mentions, and newsletter features.',
  },
  {
    icon: Headphones,
    title: 'Editorial & Content',
    description: 'Sponsored articles, artist interviews, and featured playlist placements in our growing news and editorial section.',
  },
  {
    icon: Radio,
    title: 'Event Partnerships',
    description: 'Co-branded live stream events, festival coverage partnerships, and exclusive broadcast collaborations.',
  },
];

const inquiryTypes = [
  'On-Air Advertising',
  'Artist/Label Promotion',
  'Web & Banner Ads',
  'Show Sponsorship',
  'Editorial Feature',
  'Event Partnership',
  'Other',
];

const Advertise = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!consentGiven) {
      toast({
        title: 'Consent Required',
        description: 'Please agree to the data storage consent before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const contactData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: `[Advertising] ${formData.get('inquiryType')} — ${formData.get('businessName') || 'N/A'}`,
      message: `Business: ${formData.get('businessName') || 'N/A'}\nWebsite: ${formData.get('website') || 'N/A'}\nInquiry Type: ${formData.get('inquiryType')}\n\n${formData.get('message')}`,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('contact_messages').insert([contactData]);

      if (error) {
        console.error('Supabase error:', error);
        toast({ title: 'Error', description: 'Failed to send inquiry. Please try again.', variant: 'destructive' });
        return;
      }

      if (newsletterOptIn) {
        try {
          await supabase.functions.invoke('newsletter-subscribe', {
            body: { email: contactData.email.trim().toLowerCase() },
          });
        } catch (nlError) {
          console.error('Newsletter subscription error:', nlError);
        }
      }

      const emailResponse = await supabase.functions.invoke('send-contact-email', {
        body: { ...contactData, consentGiven: true, newsletterOptIn },
      });

      if (emailResponse.error) {
        toast({ title: 'Inquiry saved', description: 'Your inquiry was saved but we couldn\'t send a confirmation email.', variant: 'destructive' });
      } else {
        toast({ title: 'Inquiry sent!', description: 'We\'ve received your advertising inquiry and will get back to you shortly.' });
        (e.target as HTMLFormElement).reset();
        setConsentGiven(false);
        setNewsletterOptIn(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({ title: 'Error', description: 'Failed to send inquiry. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Advertise with Dance One Radio"
        description="Reach a passionate electronic music audience. Explore advertising, sponsorship, and editorial partnership opportunities with Dance One Radio."
        keywords="dance one radio advertising, radio sponsorship, EDM advertising, music promotion, brand partnership"
      />
      <Navigation />
      <main className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/10 py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
          <div className="container relative mx-auto px-4 text-center">
            <Link to="/contact" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Contact
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Amplify Your Brand
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Connect with a dedicated community of electronic music enthusiasts through Dance One Radio's
              diverse advertising and partnership opportunities.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 md:gap-12 max-w-lg mx-auto">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary md:text-4xl">24/7</p>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">Live Streaming</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary md:text-4xl">Global</p>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">Audience Reach</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary md:text-4xl">400+</p>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">Episodes Aired</p>
              </div>
            </div>
          </div>
        </section>

        {/* Opportunities */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">Opportunities</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              From traditional audio spots to innovative digital campaigns, we offer flexible packages to match your goals.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opp) => (
                <div
                  key={opp.title}
                  className="group rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)]"
                >
                  <opp.icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{opp.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{opp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="border-t border-border bg-card/30 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">Get in Touch</h2>
              <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
                Tell us about your brand and goals — we'll craft a tailored proposal for you.
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="adv-name" className="mb-2 block text-sm font-medium text-foreground">Name</label>
                    <Input id="adv-name" name="name" placeholder="Your name" required disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="adv-email" className="mb-2 block text-sm font-medium text-foreground">Email</label>
                    <Input id="adv-email" name="email" type="email" placeholder="you@company.com" required disabled={isSubmitting} />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="adv-business" className="mb-2 block text-sm font-medium text-foreground">Business / Brand Name</label>
                    <Input id="adv-business" name="businessName" placeholder="Your company" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="adv-website" className="mb-2 block text-sm font-medium text-foreground">Website / URL</label>
                    <Input id="adv-website" name="website" type="url" placeholder="https://..." disabled={isSubmitting} />
                  </div>
                </div>
                <div>
                  <label htmlFor="adv-type" className="mb-2 block text-sm font-medium text-foreground">Type of Inquiry</label>
                  <select
                    id="adv-type"
                    name="inquiryType"
                    required
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select an option…</option>
                    {inquiryTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="adv-message" className="mb-2 block text-sm font-medium text-foreground">Tell Us About Your Goals</label>
                  <Textarea id="adv-message" name="message" placeholder="Describe your brand, campaign objectives, and timeline…" rows={5} required disabled={isSubmitting} />
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox id="adv-newsletter" checked={newsletterOptIn} onCheckedChange={(c) => setNewsletterOptIn(c === true)} disabled={isSubmitting} />
                  <label htmlFor="adv-newsletter" className="cursor-pointer text-sm leading-snug text-muted-foreground">
                    Subscribe to the Dance One Radio newsletter for updates, news, and exclusive content.
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox id="adv-consent" checked={consentGiven} onCheckedChange={(c) => setConsentGiven(c === true)} disabled={isSubmitting} required />
                  <label htmlFor="adv-consent" className="cursor-pointer text-sm leading-snug text-muted-foreground">
                    I consent to having this website store my submitted information so they can respond to my inquiry. The submitted information will only be used for the purpose of contacting you and follow-up. <span className="text-destructive">*</span>
                  </label>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || !consentGiven}>
                  {isSubmitting ? 'Sending…' : 'Send Inquiry'}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Advertise;
