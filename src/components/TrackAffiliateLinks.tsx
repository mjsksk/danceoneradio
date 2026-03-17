import { ExternalLink } from 'lucide-react';

interface TrackAffiliateLinksProps {
  title: string;
  artist: string;
  variant?: 'desktop' | 'mobile';
}

const TrackAffiliateLinks = ({ title, artist, variant = 'desktop' }: TrackAffiliateLinksProps) => {
  const query = encodeURIComponent(`${artist} ${title}`);

  const links = [
    {
      label: 'Beatport',
      short: 'BP',
      url: `https://www.beatport.com/search?q=${query}`,
      color: 'hover:text-green-400',
      mobileColor: 'text-green-400/70',
    },
    {
      label: 'Apple Music',
      short: '♫',
      url: `https://music.apple.com/us/search?term=${query}`,
      color: 'hover:text-pink-400',
      mobileColor: 'text-pink-400/70',
    },
    {
      label: 'Amazon Music',
      short: 'AZ',
      url: `https://www.amazon.com/s?k=${query}&tag=danceone-20`,
      color: 'hover:text-yellow-400',
      mobileColor: 'text-yellow-400/70',
    },
  ];

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-2 mt-1.5">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Find on ${link.label}`}
            className={`px-2 py-0.5 rounded-full border border-primary/20 text-[9px] font-bold ${link.mobileColor} hover:bg-primary/10 transition-colors`}
            onClick={(e) => e.stopPropagation()}
          >
            {link.short}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`Find on ${link.label}`}
          className={`w-7 h-7 flex items-center justify-center rounded text-[10px] font-bold text-muted-foreground ${link.color} hover:bg-primary/10 transition-colors`}
          onClick={(e) => e.stopPropagation()}
        >
          {link.short}
        </a>
      ))}
    </div>
  );
};

export default TrackAffiliateLinks;
