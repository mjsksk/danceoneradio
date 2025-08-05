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
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Newsletter */}
          <div className="card-cyber p-6 w-full max-w-md">
            <div className="text-center">
              <h4 className="text-xl font-['Orbitron'] font-bold text-primary mb-3">
                Stay Connected
              </h4>
              <p className="text-muted-foreground font-['Rajdhani'] mb-6">
                Get notified about new shows, exclusive tracks, and special events
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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
            <a href="/dmca" className="text-muted-foreground hover:text-primary transition-colors font-['Rajdhani'] text-sm">
              DMCA
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;