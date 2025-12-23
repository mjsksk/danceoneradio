const NewYearBanner = () => {
  // Hide banner after January 2nd, 2026
  const hideDate = new Date('2026-01-02T00:00:00');
  const now = new Date();
  
  if (now >= hideDate) {
    return null;
  }

  const message = "🎉 Tune in to the New Year's Eve dance party marathon. More than 12 hours of continuous mix from the best of the best of 2025. Come and celebrate with us! 🎉";

  return (
    <div className="fixed top-16 left-0 right-0 overflow-hidden bg-gradient-to-r from-neon/20 to-neon-purple/20 border-y border-neon/30 z-40">
      <div className="flex animate-scroll-smooth whitespace-nowrap py-4">
        <span className="text-lg font-audiowide font-bold text-neon-purple px-8">
          {message}
        </span>
        <span className="text-lg font-audiowide font-bold text-neon-purple px-8">
          {message}
        </span>
      </div>
    </div>
  );
};

export default NewYearBanner;
