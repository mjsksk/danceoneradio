import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Radio, Volume2 } from 'lucide-react';
import logo from '@/assets/dance-one-logo.png';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Live', href: '#live' },
    { name: 'Shows', href: '#shows' },
    { name: 'DJs', href: '#djs' },
    { name: 'Tracks', href: '#tracks' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={logo} 
              alt="Dance One Radio" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-['Orbitron'] font-bold text-neon">
              DANCE ONE
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 font-['Rajdhani'] font-medium uppercase tracking-wider"
              >
                {item.name}
              </a>
            ))}
            <Button className="btn-cyber">
              Listen Live
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-primary hover:bg-primary/20"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/20 animate-slide-up">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 font-['Rajdhani'] font-medium uppercase tracking-wider py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <Button className="btn-cyber w-full mt-4">
                Listen Live
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;