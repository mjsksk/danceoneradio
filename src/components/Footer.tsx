import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import appStoreBadge from '@/assets/app-store-badge-new.svg';
import googlePlayBadge from '@/assets/google-play-badge-new.svg';
import { useNewsletter } from '@/hooks/useNewsletter';
import { CookieSettingsButton } from '@/components/CookieConsent';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { subscribe, isSubmitting } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Newsletter form submitted with email:', email);
    const success = await subscribe(email);
    if (success) {
      console.log('✅ Newsletter subscription successful, clearing form');
      setEmail(''); // Clear the form on success
    } else {
      console.log('❌ Newsletter subscription failed');
    }
  };

  return <footer className="bg-card/50 border-t border-primary/20 py-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }}></div>
      </div>

      <div className="container mx-auto px-4 relative">

        <div className="flex flex-col items-center text-center space-y-8">
          {/* Social Media Links */}
          <div>
            
            <div className="flex space-x-4 justify-center">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/20" asChild>
                <a href="https://instagram.com/danceoneradio" target="_blank" rel="noopener noreferrer" aria-label="Dance One Radio on Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/20" asChild>
                <a href="https://x.com/DanceOneRadio" target="_blank" rel="noopener noreferrer" aria-label="Dance One Radio on X (Twitter)">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                  </svg>
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/20" asChild>
                <a href="https://www.facebook.com/danceoneradio" target="_blank" rel="noopener noreferrer" aria-label="Dance One Radio on Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/20" asChild>
                <a href="https://www.youtube.com/@danceoneradio" target="_blank" rel="noopener noreferrer" aria-label="Dance One Radio on YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Mobile App Links */}
          <div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <a href="https://apps.apple.com/us/app/dance-one-radio/id578991926" target="_blank" rel="noopener noreferrer" className="inline-block">
                <img 
                  src={appStoreBadge} 
                  alt="Download on the App Store" 
                  className="h-12 transition-opacity hover:opacity-80"
                 loading="lazy" decoding="async"/>
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.danceoneradio&hl=en_US&pli=1" target="_blank" rel="noopener noreferrer" className="inline-block">
                <img 
                  src={googlePlayBadge} 
                  alt="Get it on Google Play" 
                  className="h-12 transition-opacity hover:opacity-80"
                 loading="lazy" decoding="async"/>
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="card-cyber p-6 mt-12">
          <div className="text-center">
            <h4 className="text-xl font-['Orbitron'] font-bold text-primary mb-3">
              Stay Connected
            </h4>
            <p className="text-muted-foreground font-['Rajdhani'] mb-6">
              Get notified about new shows, exclusive tracks, and special events
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                aria-label="Email address for newsletter"
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 bg-input border border-border rounded-md text-foreground font-['Rajdhani'] focus:outline-none focus:ring-2 focus:ring-primary" 
                required
              />
              <Button 
                type="submit" 
                className="btn-cyber"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>

        {/* DMCA Notice */}
        

        {/* Bottom Bar */}
        <div className="border-t border-primary/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground font-['Rajdhani'] text-sm">© Dance One Radio. All rights reserved.</p>
          <div className="flex flex-wrap space-x-6 mt-4 md:mt-0">
            <a href="/about" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              About
            </a>
            <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              Privacy Policy
            </a>
            <a href="/dmca" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              DMCA
            </a>
            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;