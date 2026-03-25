import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Radio, Headphones, Globe, Mic2, Music, Megaphone,
  Clock, Smartphone, Search, Earth, Disc3,
} from 'lucide-react';

const opportunities = [
  { icon: Megaphone, title: 'On-Air Spots', description: 'Audio spots aired as pre-roll or mid-roll during live broadcasts and podcast episodes.' },
  { icon: Mic2, title: 'Artist & Label Features', description: 'Dedicated airtime spotlighting your latest release with DJ-curated intros and branding.' },
  { icon: Globe, title: 'Digital & Banner Ads', description: 'High-visibility placements across our website, apps, and newsletter.' },
  { icon: Music, title: 'Show Sponsorship', description: 'Branded intro/outro, social media mentions, and newsletter features.' },
  { icon: Headphones, title: 'Editorial & Content', description: 'Sponsored articles, interviews, and featured playlist placements.' },
  { icon: Radio, title: 'Event Partnerships', description: 'Co-branded live streams, festival coverage, and broadcast collaborations.' },
];

const inquiryTypes = [
  'On-Air Advertising', 'Artist/Label Promotion', 'Web & Banner Ads',
  'Show Sponsorship', 'Editorial Feature', 'Event Partnership', 'Other',
];

const priorities = [
  { icon: Clock, text: 'Continuous listening sessions (not bounce traffic)' },
  { icon: Smartphone, text: 'Multi-platform access (web, mobile, Alexa, apps)' },
  { icon: Search, text: 'Music discovery integration' },
  { icon: Earth, text: 'Global streaming reach' },
];

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Advertise = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consentGiven) {
      toast({ title: 'Consent Required', description: 'Please agree to the data storage consent before submitting.', variant: 'destructive' });
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
      if (error) { toast({ title: 'Error', description: 'Failed to send inquiry.', variant: 'destructive' }); return; }
      if (newsletterOptIn) {
        try { await supabase.functions.invoke('newsletter-subscribe', { body: { email: contactData.email.trim().toLowerCase() } }); } catch {}
      }
      const emailResponse = await supabase.functions.invoke('send-contact-email', { body: { ...contactData, consentGiven: true, newsletterOptIn } });
      if (emailResponse.error) {
        toast({ title: 'Inquiry saved', description: "Your inquiry was saved but we couldn't send a confirmation email.", variant: 'destructive' });
      } else {
        toast({ title: 'Inquiry sent!', description: "We've received your advertising inquiry and will get back to you shortly." });
        (e.target as HTMLFormElement).reset();
        setConsentGiven(false);
        setNewsletterOptIn(false);
      }
    } catch { toast({ title: 'Error', description: 'Failed to send inquiry.', variant: 'destructive' }); } finally { setIsSubmitting(false); }
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

        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_60%)]" />
          <div className="container relative mx-auto px-4 text-center">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Advertising & Partnerships
            </motion.p>
            <motion.h1 {...fade} className="text-3xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.1]">
              The Sound of Global<br />Dance Culture
            </motion.h1>
            <motion.p {...fade} transition={{ delay: 0.15 }} className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg leading-relaxed">
              Dance One Radio streams the best in house, techno, and electronic music to a global audience 24/7 — across web, mobile, and smart devices.
            </motion.p>
            <motion.p {...fade} transition={{ delay: 0.3 }} className="mt-8 text-sm text-muted-foreground italic md:text-base">
              "Our audience doesn't just visit — they stay, listen, and engage."
            </motion.p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </section>

        {/* ─── WHY DANCE ONE RADIO ─── */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-foreground md:text-4xl text-center">
                Why Dance One Radio
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground text-sm leading-relaxed md:text-base">
                <p>Unlike traditional radio stations or music blogs, Dance One Radio delivers a curated, uninterrupted music experience designed for real electronic music listeners.</p>
                <p>Our listeners don't bounce — they stay connected for extended sessions, creating deeper engagement and stronger brand impact.</p>
                <p>We focus on quality sound, global reach, and seamless listening across all devices.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── DISCOVERY ─── */}
        <section className="relative py-12 md:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.04),transparent_70%)]" />
          <div className="container relative mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                <Disc3 className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground md:text-4xl">Discover Music Instantly</h2>
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed md:text-base">
                Every track played on Dance One Radio connects listeners to official platforms like Apple Music, Beatport, and more — turning listening into instant discovery.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── HOW WE COMPARE ─── */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-foreground md:text-4xl text-center">How We Compare</h2>
              <p className="mt-4 text-center text-muted-foreground text-sm leading-relaxed md:text-base">
                Many platforms focus on website traffic rankings — but real radio success comes from listener engagement.
              </p>
              <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Dance One Radio prioritizes:
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {priorities.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/20 px-4 py-3">
                    <p.icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
                    <span className="text-sm text-muted-foreground">{p.text}</span>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-foreground font-medium md:text-base">
                Dance One Radio is not just a website — it's a <span className="text-primary">digital music platform</span>.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── OPPORTUNITIES ─── */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-2xl font-bold text-foreground md:text-4xl">Opportunities</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
              Flexible packages to match your goals — from audio spots to digital campaigns.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opp) => (
                <div key={opp.title} className="group rounded-lg border border-border/40 bg-card/20 p-5 transition-all hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.06)]">
                  <opp.icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="mt-3 text-base font-semibold text-foreground">{opp.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground md:text-sm">{opp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CONTACT FORM ─── */}
        <section className="border-t border-border bg-card/15 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-center text-2xl font-bold text-foreground md:text-4xl">Get in Touch</h2>
              <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">
                Tell us about your brand and goals — we'll craft a tailored proposal for you.
              </p>
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="adv-name" className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                    <Input id="adv-name" name="name" placeholder="Your name" required disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="adv-email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                    <Input id="adv-email" name="email" type="email" placeholder="you@company.com" required disabled={isSubmitting} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="adv-business" className="mb-1.5 block text-sm font-medium text-foreground">Business / Brand Name</label>
                    <Input id="adv-business" name="businessName" placeholder="Your company" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="adv-website" className="mb-1.5 block text-sm font-medium text-foreground">Website / URL</label>
                    <Input id="adv-website" name="website" type="url" placeholder="https://..." disabled={isSubmitting} />
                  </div>
                </div>
                <div>
                  <label htmlFor="adv-type" className="mb-1.5 block text-sm font-medium text-foreground">Type of Inquiry</label>
                  <select
                    id="adv-type" name="inquiryType" required disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select an option…</option>
                    {inquiryTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="adv-message" className="mb-1.5 block text-sm font-medium text-foreground">Tell Us About Your Goals</label>
                  <Textarea id="adv-message" name="message" placeholder="Describe your brand, campaign objectives, and timeline…" rows={4} required disabled={isSubmitting} />
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox id="adv-newsletter" checked={newsletterOptIn} onCheckedChange={(c) => setNewsletterOptIn(c === true)} disabled={isSubmitting} />
                  <label htmlFor="adv-newsletter" className="cursor-pointer text-xs leading-snug text-muted-foreground">
                    Subscribe to the Dance One Radio newsletter for updates, news, and exclusive content.
                  </label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox id="adv-consent" checked={consentGiven} onCheckedChange={(c) => setConsentGiven(c === true)} disabled={isSubmitting} required />
                  <label htmlFor="adv-consent" className="cursor-pointer text-xs leading-snug text-muted-foreground">
                    I consent to having this website store my submitted information so they can respond to my inquiry. <span className="text-destructive">*</span>
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
