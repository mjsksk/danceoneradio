import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';

export function LoginPrompt() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex flex-col items-center text-center gap-4">
        <UserCircle className="w-12 h-12 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Save Your Listening Progress
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a free account to automatically save your place in episodes and pick up right where you left off.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/auth">Sign Up Free</Link>
        </Button>
      </div>
    </Card>
  );
}
