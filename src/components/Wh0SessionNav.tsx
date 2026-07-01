import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Ordered ascending. Update when new sessions are added.
const SESSIONS = [222, 223, 224, 225, 226, 230, 232, 233, 235, 236] as const;

interface Props {
  current: number;
  className?: string;
}

const Wh0SessionNav = ({ current, className = '' }: Props) => {
  const idx = SESSIONS.indexOf(current as typeof SESSIONS[number]);
  const prev = idx > 0 ? SESSIONS[idx - 1] : null;
  const next = idx >= 0 && idx < SESSIONS.length - 1 ? SESSIONS[idx + 1] : null;

  return (
    <nav
      aria-label="Wh0 Sessions navigation"
      className={`flex items-center justify-between gap-3 ${className}`}
    >
      {prev ? (
        <Link to={`/show/wh0-plays-sessions/${prev}`} className="flex-1">
          <Button variant="outline" className="w-full justify-start hover:text-neon hover:border-neon/60">
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span className="truncate">Previous · Session {prev}</span>
          </Button>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link to={`/show/wh0-plays-sessions/${next}`} className="flex-1">
          <Button variant="outline" className="w-full justify-end hover:text-neon-purple hover:border-neon-purple/60">
            <span className="truncate">Next · Session {next}</span>
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
};

export default Wh0SessionNav;
