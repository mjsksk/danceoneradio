import { Button } from '@/components/ui/button';
import { Radio, Instagram, Twitter, Facebook, Youtube, Mail, Phone } from 'lucide-react';
import appStoreBadge from '@/assets/app-store-badge.svg';
import googlePlayBadge from '@/assets/google-play-badge.png';
const Footer = () => {
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
                <a href="https://instagram.com/danceoneradio" target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/20" asChild>
                <a href="https://x.com/DanceOneRadio" target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/20" asChild>
                <a href="https://www.facebook.com/danceoneradio" target="_blank" rel="noopener noreferrer">
                  <Facebook className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/20" asChild>
                <a href="https://www.youtube.com/@danceoneradio" target="_blank" rel="noopener noreferrer">
                  <Youtube className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Mobile App Links */}
          <div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
              <a href="https://apps.apple.com/us/app/dance-one-radio/id578991926" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
                <img src={appStoreBadge} alt="Download on the App Store" className="w-32 h-auto" />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.danceoneradio&hl=en_US&pli=1" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
                <img src={googlePlayBadge} alt="Get it on Google Play" className="w-32 h-auto" />
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
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-2 bg-input border border-border rounded-md text-foreground font-['Rajdhani'] focus:outline-none focus:ring-2 focus:ring-primary" />
              <Button className="btn-cyber">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* DMCA Notice */}
        

        {/* Bottom Bar */}
        <div className="border-t border-primary/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground font-['Rajdhani'] text-sm">© Dance One Radio. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              Privacy Policy
            </a>
            <a href="/love" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              Love
            </a>
            <a href="/dmca" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              DMCA
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;