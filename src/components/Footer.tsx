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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <Radio className="w-10 h-10 text-primary animate-glow-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-['Orbitron'] font-bold text-neon">
                  DANCE ONE RADIO
                </h3>
                <p className="text-sm text-accent font-['Rajdhani']">
                  The Castle of Dance
                </p>
              </div>
            </div>
            <p className="text-muted-foreground font-['Rajdhani'] mb-6 max-w-md">
              Broadcasting the future of electronic dance music. Join us every Friday at 5PM Pacific for biweekly episodes featuring brand new music and exclusive tracks.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/20"
              >
                <Instagram className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/20"
              >
                <Twitter className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/20"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/20"
              >
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-['Orbitron'] font-semibold text-primary mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#live" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani']">
                  Listen Live
                </a>
              </li>
              <li>
                <a href="#shows" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani']">
                  Show Schedule
                </a>
              </li>
              <li>
                <a href="#djs" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani']">
                  Featured DJs
                </a>
              </li>
              <li>
                <a href="#tracks" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani']">
                  Latest Tracks
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani']">
                  Mobile App
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-['Orbitron'] font-semibold text-primary mb-6">
              Contact
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground font-['Rajdhani']">
                  hello@danceoneradio.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground font-['Rajdhani']">
                  +1 (555) 123-DANCE
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="text-sm font-['Orbitron'] font-semibold text-accent mb-3 uppercase tracking-wider">
                Submit Demo
              </h5>
              <Button className="btn-cyber w-full" size="sm">
                Send Track
              </Button>
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

        {/* Bottom Bar */}
        <div className="border-t border-primary/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground font-['Rajdhani'] text-sm">
            © 2024 Dance One Radio. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              DMCA
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;