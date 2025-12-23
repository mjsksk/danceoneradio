import { Sparkles, PartyPopper } from "lucide-react";

const NewYearBanner = () => {
  // Hide banner after January 2nd, 2026
  const hideDate = new Date('2026-01-02T00:00:00');
  const now = new Date();
  
  if (now >= hideDate) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 overflow-hidden bg-gradient-to-r from-primary via-neon-purple to-primary py-3 px-4 z-40">
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      
      {/* Sparkle particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1 left-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '0s' }} />
        <div className="absolute top-2 right-1/3 w-1 h-1 bg-white rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1 left-1/2 w-1 h-1 bg-white rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1 right-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <div className="relative flex items-center justify-center gap-3 text-center">
        <PartyPopper className="w-5 h-5 text-white flex-shrink-0 animate-bounce" />
        <p className="font-['Rajdhani'] font-semibold text-sm md:text-base text-white tracking-wide">
          <span className="hidden sm:inline">🎉 </span>
          Tune in to the New Year's Eve dance party marathon. More than 12 hours of continuous mix from the best of the best of 2025. Come and celebrate with us!
          <span className="hidden sm:inline"> 🎉</span>
        </p>
        <Sparkles className="w-5 h-5 text-white flex-shrink-0 animate-pulse" />
      </div>
    </div>
  );
};

export default NewYearBanner;
