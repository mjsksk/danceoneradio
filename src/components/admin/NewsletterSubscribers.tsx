import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Monitor, 
  Search, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  country: string | null;
  city: string | null;
  region: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
}

const ITEMS_PER_PAGE = 10;

const NewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('newsletter_subscribers')
        .select('id, email, is_active, subscribed_at, country, city, region, browser, os, device_type', { count: 'exact' })
        .order('subscribed_at', { ascending: false });

      if (debouncedSearch) {
        query = query.or(`email.ilike.%${debouncedSearch}%,country.ilike.%${debouncedSearch}%,city.ilike.%${debouncedSearch}%`);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('Error fetching subscribers:', error);
        return;
      }

      setSubscribers(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, debouncedSearch]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const formatLocation = (subscriber: Subscriber) => {
    const parts = [subscriber.city, subscriber.region, subscriber.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
  };

  const formatDevice = (subscriber: Subscriber) => {
    const parts = [subscriber.browser, subscriber.os, subscriber.device_type].filter(Boolean);
    return parts.length > 0 ? parts.join(' • ') : '—';
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-['Orbitron'] font-bold text-neon-purple">
            Newsletter Subscribers
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-['Rajdhani']">
            <Users className="w-3 h-3 mr-1" />
            {totalCount} total
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscribers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by email, country, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 font-['Rajdhani']"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-['Orbitron'] text-xs">Email</TableHead>
              <TableHead className="font-['Orbitron'] text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date
                </div>
              </TableHead>
              <TableHead className="font-['Orbitron'] text-xs">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </div>
              </TableHead>
              <TableHead className="font-['Orbitron'] text-xs">
                <div className="flex items-center gap-1">
                  <Monitor className="w-3 h-3" /> Device
                </div>
              </TableHead>
              <TableHead className="font-['Orbitron'] text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-['Rajdhani']">
                  {debouncedSearch ? 'No subscribers found matching your search.' : 'No subscribers yet.'}
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber.id} className="font-['Rajdhani']">
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(subscriber.subscribed_at), 'MMM d, yyyy')}
                    <br />
                    <span className="text-xs">{format(new Date(subscriber.subscribed_at), 'h:mm a')}</span>
                  </TableCell>
                  <TableCell className="text-sm">{formatLocation(subscriber)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDevice(subscriber)}</TableCell>
                  <TableCell>
                    <Badge variant={subscriber.is_active ? 'default' : 'secondary'}>
                      {subscriber.is_active ? 'Active' : 'Unsubscribed'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground font-['Rajdhani']">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default NewsletterSubscribers;
