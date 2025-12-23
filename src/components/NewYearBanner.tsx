import { Sparkles, PartyPopper } from "lucide-react";

const NewYearBanner = () => {
  // Hide banner after January 2nd, 2026
  const hideDate = new Date('2026-01-02T00:00:00');
  const now = new Date();
  
  if (now >= hideDate) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black py-3 px-4">
      {/* Animated sparkle background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-75" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1 left-1/2 w-1 h-1 bg-white rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2 right-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-70" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/6 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '0.3s' }} />
      </div>
      
      <div className="relative flex items-center justify-center gap-3 text-center">
        <PartyPopper className="w-5 h-5 text-black flex-shrink-0 animate-bounce" />
        <p className="font-bold text-sm md:text-base">
          <span className="hidden sm:inline">🎉 </span>
          Tune in to the New Year's Eve dance party marathon. More than 12 hours of continuous mix from the best of the best of 2025. Come and celebrate with us!
          <span className="hidden sm:inline"> 🎉</span>
        </p>
        <Sparkles className="w-5 h-5 text-black flex-shrink-0 animate-pulse" />
      </div>
    </div>
  );
};

export default NewYearBanner;
