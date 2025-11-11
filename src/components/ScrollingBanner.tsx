import { memo } from 'react';

const ScrollingBanner = memo(() => {
  return (
    <div className="overflow-hidden bg-gradient-to-r from-neon/20 to-neon-purple/20 border-y border-neon/30 mb-12">
      <div className="animate-scroll whitespace-nowrap py-4">
        <span className="text-lg font-audiowide font-bold text-neon-purple mx-8">
          Listen to biweekly rebranded episodes on Friday at 5 PM Pacific. One hour of brand new music featured with exclusives. Download the mobile app below to get updates today.
        </span>
      </div>
    </div>
  );
});

ScrollingBanner.displayName = 'ScrollingBanner';

export default ScrollingBanner;
