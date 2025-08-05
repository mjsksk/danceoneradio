import { Button } from '@/components/ui/button';
import { Radio, Instagram, Twitter, Facebook, Youtube, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card/50 border-t border-primary/20 py-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Social Media and App Links */}
          <div>
            <div className="flex space-x-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/20"
                asChild
              >
                <a href="https://instagram.com/danceoneradio" target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-5 h-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/20"
                asChild
              >
                <a href="https://x.com/DanceOneRadio" target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-5 h-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/20"
                asChild
              >
                <a href="https://www.facebook.com/danceoneradio" target="_blank" rel="noopener noreferrer">
                  <Facebook className="w-5 h-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/20"
              >
                <Youtube className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile App Links */}
            <div>
              <h5 className="text-sm font-['Orbitron'] font-semibold text-accent mb-4 uppercase tracking-wider">
                Download Our App
              </h5>
              <div className="flex flex-col space-y-4">
                <a 
                  href="https://apps.apple.com/us/app/dance-one-radio/id578991926" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/src/assets/app-store-badge.svg" 
                    alt="Download on the App Store" 
                    className="h-20 w-auto"
                  />
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=com.danceoneradio&hl=en_US&pli=1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/src/assets/google-play-badge.png" 
                    alt="Get it on Google Play" 
                    className="h-20 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Demo Submission */}
          <div>
            <h5 className="text-sm font-['Orbitron'] font-semibold text-accent mb-3 uppercase tracking-wider">
              Submit Demo
            </h5>
            <Button className="btn-cyber w-full" size="sm">
              Send Track
            </Button>
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
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-input border border-border rounded-md text-foreground font-['Rajdhani'] focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="btn-cyber">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* DMCA Notice */}
        <div className="card-cyber p-6 mt-12 bg-primary/5">
          <h4 className="text-lg font-['Orbitron'] font-semibold text-primary mb-4">
            DMCA Notice
          </h4>
          <p className="text-muted-foreground font-['Rajdhani'] text-sm leading-relaxed">
            Dance One Radio respects the intellectual property rights of others. If you believe that material on our platform infringes your copyright, 
            please send us a written notice via email to dmca@danceoneradio.com. We will promptly investigate and take appropriate action in accordance 
            with the Digital Millennium Copyright Act (DMCA). All music played on Dance One Radio is either licensed, royalty-free, or falls under 
            fair use guidelines for radio broadcasting.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground font-['Rajdhani'] text-sm">
            © 2024 Dance One Radio. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              Privacy Policy
            </a>
            <a href="/love" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              Love
            </a>
            <a href="mailto:dmca@danceoneradio.com" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              DMCA
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;