import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Radio, Headphones, Globe, Mic2, Music, Megaphone, ArrowLeft,
  Earth, Clock, Podcast, Zap, Smartphone, BarChart3, Search, Disc3,
} from 'lucide-react';

const opportunities = [
  { icon: Megaphone, title: 'On-Air Spots', description: 'Professionally produced 15, 30, or 60-second audio spots aired as pre-roll or mid-roll during live broadcasts and podcast episodes.' },
  { icon: Mic2, title: 'Artist & Label Features', description: 'Dedicated airtime segments spotlighting your latest release, remix, or EP with DJ-curated intros and custom branding.' },
  { icon: Globe, title: 'Digital & Banner Ads', description: 'High-visibility placements across our website, apps, and newsletter reaching thousands of engaged electronic music fans.' },
  { icon: Music, title: 'Show Sponsorship', description: 'Align your brand with one of our weekly shows. Includes branded intro/outro, social media mentions, and newsletter features.' },
  { icon: Headphones, title: 'Editorial & Content', description: 'Sponsored articles, artist interviews, and featured playlist placements in our growing news and editorial section.' },
  { icon: Radio, title: 'Event Partnerships', description: 'Co-branded live stream events, festival coverage partnerships, and exclusive broadcast collaborations.' },
];

const inquiryTypes = [
  'On-Air Advertising', 'Artist/Label Promotion', 'Web & Banner Ads',
  'Show Sponsorship', 'Editorial Feature', 'Event Partnership', 'Other',
];

const metrics = [
  { icon: Earth, value: '{{GLOBAL_REACH}}', label: 'Countries Reached' },
  { icon: Headphones, value: '{{MONTHLY_LISTENERS}}', label: 'Monthly Listeners' },
  { icon: Clock, value: '{{AVG_LISTEN_TIME}}', label: 'Avg Listening Time' },
  { icon: Podcast, value: '{{STREAM_HOURS}}', label: 'Hours Streamed Monthly' },
];

const priorities = [
  { icon: Clock, text: 'Continuous listening sessions (not bounce traffic)' },
  { icon: Smartphone, text: 'Multi-platform access (web, mobile, Alexa, apps)' },
  { icon: Search, text: 'Music discovery integration' },
  { icon: Earth, text: 'Global streaming reach' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
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

        {/* ─── SECTION 1: HERO ─── */}
        <section className="relative overflow-hidden py-28 md:py-40">
          {/* Layered background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.08),transparent_50%)]" />

          <div className="container relative mx-auto px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} custom={0} className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                Advertising & Partnerships
              </motion.p>
              <motion.h1 variants={fadeUp} custom={1} className="text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl leading-[1.1]">
                The Sound of Global<br />Dance Culture
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                Dance One Radio streams the best in house, techno, and electronic music to a global audience 24/7 — across web, mobile, and smart devices.
              </motion.p>
            </motion.div>
          </div>

          {/* Decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </section>

        {/* ─── SECTION 2: REAL AUTHORITY METRICS ─── */}
        <section className="relative py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12"
            >
              {metrics.map((m, i) => (
                <motion.div key={m.label} variants={fadeUp} custom={i} className="text-center">
                  <m.icon className="mx-auto mb-4 h-8 w-8 text-primary/70" strokeWidth={1.5} />
                  <p className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">{m.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base">{m.label}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-14 text-center text-base text-muted-foreground italic md:text-lg"
            >
              "Our audience doesn't just visit — they stay, listen, and engage."
            </motion.p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>

        {/* ─── SECTION 3: WHY DANCE ONE RADIO ─── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="mx-auto max-w-3xl"
            >
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold text-foreground md:text-5xl text-center">
                Why Dance One Radio
              </motion.h2>
              <motion.div variants={fadeUp} custom={1} className="mt-10 space-y-6 text-muted-foreground text-base leading-relaxed md:text-lg">
                <p>
                  Unlike traditional radio stations or music blogs, Dance One Radio delivers a curated, uninterrupted music experience designed for real electronic music listeners.
                </p>
                <p>
                  Our listeners don't bounce — they stay connected for extended sessions, creating deeper engagement and stronger brand impact.
                </p>
                <p>
                  We focus on quality sound, global reach, and seamless listening across all devices.
                </p>
              </motion.div>
            </motion.div>
          </div>
          <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>

        {/* ─── SECTION 4: DISCOVERY & MONETIZATION ─── */}
        <section className="relative py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.06),transparent_70%)]" />
          <div className="container relative mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="mx-auto max-w-3xl text-center"
            >
              <motion.div variants={fadeUp} custom={0} className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
                <Disc3 className="h-8 w-8 text-primary" />
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold text-foreground md:text-5xl">
                Discover Music Instantly
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="mt-6 text-muted-foreground text-base leading-relaxed md:text-lg">
                Every track played on Dance One Radio connects listeners to official platforms like Apple Music, Beatport, and more — turning listening into instant discovery.
              </motion.p>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>

        {/* ─── SECTION 5: HOW WE COMPARE ─── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="mx-auto max-w-3xl"
            >
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold text-foreground md:text-5xl text-center">
                How We Compare
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="mt-6 text-center text-muted-foreground text-base leading-relaxed md:text-lg">
                Many platforms focus on website traffic rankings — but real radio success comes from listener engagement.
              </motion.p>
              <motion.p variants={fadeUp} custom={2} className="mt-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Dance One Radio prioritizes:
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="mt-10 grid gap-4 sm:grid-cols-2">
                {priorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm">
                    <p.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
                    <p className="text-sm text-muted-foreground md:text-base">{p.text}</p>
                  </div>
                ))}
              </motion.div>

              <motion.p variants={fadeUp} custom={4} className="mt-12 text-center text-base text-foreground font-medium md:text-lg">
                Dance One Radio is not just a website — it's a <span className="text-primary">digital music platform</span>.
              </motion.p>
            </motion.div>
          </div>
          <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>

        {/* ─── OPPORTUNITIES ─── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} custom={0} className="text-center text-3xl font-bold text-foreground md:text-4xl">
                Opportunities
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
                From traditional audio spots to innovative digital campaigns, we offer flexible packages to match your goals.
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {opportunities.map((opp, i) => (
                <motion.div
                  key={opp.title}
                  variants={fadeUp}
                  custom={i}
                  className="group rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.08)]"
                >
                  <opp.icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{opp.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{opp.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── CONTACT FORM ─── */}
        <section className="border-t border-border bg-card/20 py-16 md:py-24">
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
                    id="adv-type" name="inquiryType" required disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select an option…</option>
                    {inquiryTypes.map((t) => <option key={t} value={t}>{t}</option>)}
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
