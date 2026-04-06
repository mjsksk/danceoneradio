import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, UserCircle, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import logo from '@/assets/dance-one-logo.png';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'News', href: '/news' },
    { name: 'About', href: '/about' },
    { name: 'Shows', href: '/shows' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Apps', href: '/apps' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Requests', href: '/requests' },
    { name: 'Merch', href: '/merch' },
    { name: 'Love', href: '/love' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-[9999] bg-background/80 backdrop-blur-md border-b border-primary/20"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8 flex-1 justify-center" role="menubar">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-muted-foreground hover:text-primary focus:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm transition-colors duration-300 font-medium text-sm tracking-tight"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                role="menuitem"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center absolute right-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full min-w-[44px] min-h-[44px]"
                    aria-label="User menu"
                  >
                    <UserCircle className="w-6 h-6 text-primary" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {profile?.display_name || user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="min-h-[44px]">
                <Link to="/auth" aria-label="Login to your account">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button - Positioned on the right */}
          <div className="md:hidden absolute right-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-primary hover:bg-primary/20 min-w-[44px] min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden py-4 border-t border-primary/20 animate-slide-up"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary transition-colors duration-300 font-medium text-sm tracking-tight min-h-[44px] flex items-center px-3 py-2 rounded-md -mx-3"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Auth Links - Mobile */}
              <div className="pt-4 mt-2 border-t border-border/50">
                {user ? (
                  <>
                    <Link
                      to="/account"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary transition-colors duration-300 font-medium text-sm tracking-tight min-h-[44px] flex items-center px-3 py-2 rounded-md -mx-3"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                      onClick={() => setIsMenuOpen(false)}
                      role="menuitem"
                      aria-label="Go to account settings"
                    >
                      <Settings className="w-5 h-5 mr-3" aria-hidden="true" />
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary transition-colors duration-300 font-medium text-sm tracking-tight min-h-[44px] flex items-center px-3 py-2 rounded-md -mx-3 w-[calc(100%+1.5rem)]"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                      role="menuitem"
                      aria-label="Sign out of your account"
                    >
                      <LogOut className="w-5 h-5 mr-3" aria-hidden="true" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="text-primary hover:text-primary/80 hover:bg-primary/10 focus:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary transition-colors duration-300 font-medium text-sm tracking-tight min-h-[44px] flex items-center px-3 py-2 rounded-md -mx-3"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                    aria-label="Login to your account"
                  >
                    <UserCircle className="w-5 h-5 mr-3" aria-hidden="true" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;