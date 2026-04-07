import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Music,
  Search,
  RefreshCw,
  Check,
  X,
  Play,
  RotateCcw,
  Trash2,
  Copy,
  StickyNote,
  AlertTriangle,
  ListMusic,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface SongRequest {
  id: string;
  created_at: string;
  listener_name: string;
  email: string | null;
  artist_name: string;
  song_title: string;
  message: string | null;
  status: string;
  is_duplicate: boolean;
  duplicate_reason: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  sam_imported_at: string | null;
}

type StatusFilter = 'all' | 'new' | 'approved' | 'rejected' | 'played' | 'queued';

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  played: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  queued: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export default function SongRequestsManager() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notesDialogId, setNotesDialogId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [compactView, setCompactView] = useState(false);
  const [detailReq, setDetailReq] = useState<SongRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('song_requests')
        .select('id, created_at, listener_name, email, artist_name, song_title, message, status, is_duplicate, duplicate_reason, admin_notes, reviewed_by, reviewed_at, sam_imported_at')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (search) {
        query = query.or(
          `artist_name.ilike.%${search}%,song_title.ilike.%${search}%,listener_name.ilike.%${search}%`
        );
      }

      const { data, error } = await query.limit(200);
      if (error) throw error;
      setRequests((data as unknown as SongRequest[]) || []);
    } catch (err) {
      console.error('[SongRequests] Error:', err);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('song_requests')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status, reviewed_at: new Date().toISOString() } : r))
      );
      toast.success(`Request marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.size === 0) return;
    try {
      const { error } = await supabase
        .from('song_requests')
        .update({ status, reviewed_at: new Date().toISOString() })
        .in('id', Array.from(selectedIds));
      if (error) throw error;
      setRequests(prev =>
        prev.map(r =>
          selectedIds.has(r.id) ? { ...r, status, reviewed_at: new Date().toISOString() } : r
        )
      );
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} requests updated to ${status}`);
    } catch {
      toast.error('Bulk update failed');
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('Delete this request?')) return;
    try {
      const { error } = await supabase.from('song_requests').delete().eq('id', id);
      if (error) throw error;
      setRequests(prev => prev.filter(r => r.id !== id));
      toast.success('Request deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const saveNotes = async () => {
    if (!notesDialogId) return;
    try {
      const { error } = await supabase
        .from('song_requests')
        .update({ admin_notes: notesText })
        .eq('id', notesDialogId);
      if (error) throw error;
      setRequests(prev =>
        prev.map(r => (r.id === notesDialogId ? { ...r, admin_notes: notesText } : r))
      );
      setNotesDialogId(null);
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save');
    }
  };

  const copyRequestText = (r: SongRequest) => {
    const text = `Requested: ${r.artist_name} - ${r.song_title} | From: ${r.listener_name}`;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === requests.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(requests.map(r => r.id)));
  };

  const counts = {
    new: requests.filter(r => r.status === 'new').length,
    total: requests.length,
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 font-['Orbitron'] text-xl">
            <ListMusic className="w-5 h-5 text-primary" />
            Song Requests
            {counts.new > 0 && (
              <Badge variant="secondary" className="ml-2">{counts.new} new</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCompactView(!compactView)}>
              {compactView ? 'Full View' : 'Queue View'}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchRequests}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search artist, song, listener..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({requests.length})</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="played">Played</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('approved')}>
              <Check className="w-3 h-3 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('rejected')}>
              <X className="w-3 h-3 mr-1" /> Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('played')}>
              <Play className="w-3 h-3 mr-1" /> Played
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No song requests found</p>
          </div>
        ) : compactView ? (
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                <Badge className={statusColors[r.status] || ''} variant="outline">{r.status}</Badge>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{r.artist_name} — {r.song_title}</span>
                  <span className="text-xs text-muted-foreground ml-2">from {r.listener_name}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => copyRequestText(r)}><Copy className="w-3 h-3" /></Button>
                {r.status === 'new' && (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, 'approved')}><Check className="w-3 h-3" /></Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selectedIds.size === requests.length && requests.length > 0} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Listener</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Song</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(r => (
                  <TableRow key={r.id} className={r.is_duplicate ? 'bg-yellow-500/5' : ''}>
                    <TableCell>
                      <Checkbox checked={selectedIds.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} />
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{formatDate(r.created_at)}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{r.listener_name}</div>
                      {r.email && <div className="text-xs text-muted-foreground">{r.email}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{r.artist_name}</TableCell>
                    <TableCell className="text-sm">{r.song_title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge className={statusColors[r.status] || ''} variant="outline">{r.status}</Badge>
                        {r.is_duplicate && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      {r.message && <p className="text-xs text-muted-foreground truncate" title={r.message}>{r.message}</p>}
                      {r.admin_notes && <p className="text-xs text-primary/70 truncate mt-0.5" title={r.admin_notes}>📝 {r.admin_notes}</p>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setDetailReq(r)} title="Details"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => copyRequestText(r)} title="Copy"><Copy className="w-3.5 h-3.5" /></Button>
                        {r.status !== 'approved' && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, 'approved')} title="Approve" className="text-green-400 hover:text-green-300">
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {r.status !== 'rejected' && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, 'rejected')} title="Reject" className="text-red-400 hover:text-red-300">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {r.status === 'approved' && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, 'played')} title="Mark Played" className="text-purple-400 hover:text-purple-300">
                            <Play className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {r.status !== 'new' && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, 'new')} title="Reset"><RotateCcw className="w-3.5 h-3.5" /></Button>
                        )}
                        <Dialog open={notesDialogId === r.id} onOpenChange={(open) => {
                          if (open) { setNotesDialogId(r.id); setNotesText(r.admin_notes || ''); }
                          else setNotesDialogId(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" title="Notes"><StickyNote className="w-3.5 h-3.5" /></Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Admin Notes</DialogTitle></DialogHeader>
                            <div className="space-y-3">
                              <p className="text-sm text-muted-foreground">{r.artist_name} — {r.song_title} (from {r.listener_name})</p>
                              <Textarea value={notesText} onChange={e => setNotesText(e.target.value)} placeholder="Internal notes..." rows={3} />
                              <Button onClick={saveNotes} className="w-full">Save</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="ghost" onClick={() => deleteRequest(r.id)} title="Delete" className="text-destructive hover:text-destructive/80">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Detail dialog */}
        <Dialog open={!!detailReq} onOpenChange={(open) => { if (!open) setDetailReq(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
            </DialogHeader>
            {detailReq && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[100px_1fr] gap-y-2">
                  <span className="text-muted-foreground">Listener</span>
                  <span className="font-medium">{detailReq.listener_name}</span>
                  {detailReq.email && <>
                    <span className="text-muted-foreground">Email</span>
                    <span>{detailReq.email}</span>
                  </>}
                  <span className="text-muted-foreground">Artist</span>
                  <span className="font-medium">{detailReq.artist_name}</span>
                  <span className="text-muted-foreground">Song</span>
                  <span className="font-medium">{detailReq.song_title}</span>
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={statusColors[detailReq.status] || ''} variant="outline">{detailReq.status}</Badge>
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{formatDate(detailReq.created_at)}</span>
                  {detailReq.reviewed_at && <>
                    <span className="text-muted-foreground">Reviewed</span>
                    <span>{formatDate(detailReq.reviewed_at)}</span>
                  </>}
                  {detailReq.sam_imported_at && <>
                    <span className="text-muted-foreground">SAM Import</span>
                    <span>{formatDate(detailReq.sam_imported_at)}</span>
                  </>}
                </div>
                {detailReq.message && (
                  <div>
                    <p className="text-muted-foreground mb-1">Message</p>
                    <p className="bg-muted/50 rounded p-2 text-xs">{detailReq.message}</p>
                  </div>
                )}
                {detailReq.admin_notes && (
                  <div>
                    <p className="text-muted-foreground mb-1">Admin Notes</p>
                    <p className="bg-primary/10 rounded p-2 text-xs">{detailReq.admin_notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
