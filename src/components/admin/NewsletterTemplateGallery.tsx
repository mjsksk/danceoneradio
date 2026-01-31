import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Music, Calendar, Newspaper, Star, Gift, 
  Plus, Trash2, Save, Loader2, BookTemplate 
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BuiltInTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  content: string;
}

interface CustomTemplate {
  id: string;
  name: string;
  description: string | null;
  content: string;
  created_at: string;
}

const builtInTemplates: BuiltInTemplate[] = [
  {
    id: 'new-episode',
    name: 'New Episode',
    description: 'Announce a new podcast episode',
    icon: <Music className="w-5 h-5" />,
    content: `<h2 style="color: #333; margin-bottom: 15px;">🎧 New Episode Alert!</h2>
<p style="font-size: 16px; line-height: 1.6; color: #555;">
  We're excited to announce <strong>Episode XXX</strong> of Dance One Radio is now live!
</p>
<p style="font-size: 16px; line-height: 1.6; color: #555;">
  This week features an incredible mix of the latest EDM tracks, including hits from top artists in the scene.
</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
  <tr>
    <td style="background-color: #007bff; border-radius: 5px;">
      <a href="https://danceoneradio.lovable.app/shows" style="display: inline-block; padding: 12px 24px; color: white; text-decoration: none; font-weight: bold;">
        Listen Now →
      </a>
    </td>
  </tr>
</table>
<p style="font-size: 14px; color: #888;">
  Available on our website and all major podcast platforms.
</p>`
  },
  {
    id: 'weekly-roundup',
    name: 'Weekly Roundup',
    description: 'Summary of the week\'s highlights',
    icon: <Newspaper className="w-5 h-5" />,
    content: `<h2 style="color: #333; margin-bottom: 15px;">📻 This Week at Dance One Radio</h2>
<p style="font-size: 16px; line-height: 1.6; color: #555;">
  Here's what you might have missed this week:
</p>
<ul style="font-size: 16px; line-height: 1.8; color: #555; padding-left: 20px;">
  <li><strong>New Episodes:</strong> Episodes XXX and XXX are now available</li>
  <li><strong>Top Track:</strong> [Artist] - [Track Name]</li>
  <li><strong>Coming Up:</strong> Special guest mix next week</li>
</ul>
<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
<p style="font-size: 16px; line-height: 1.6; color: #555;">
  Don't forget to tune in to our live stream for 24/7 electronic music!
</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
  <tr>
    <td style="background-color: #28a745; border-radius: 5px;">
      <a href="https://danceoneradio.lovable.app" style="display: inline-block; padding: 12px 24px; color: white; text-decoration: none; font-weight: bold;">
        Listen Live
      </a>
    </td>
  </tr>
</table>`
  },
  {
    id: 'event-announcement',
    name: 'Event Announcement',
    description: 'Promote upcoming events or shows',
    icon: <Calendar className="w-5 h-5" />,
    content: `<h2 style="color: #333; margin-bottom: 15px;">🎉 Upcoming Event!</h2>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 15px 0;">
  <tr>
    <td style="padding: 20px;">
      <h3 style="color: #333; margin: 0 0 10px 0;">[Event Name]</h3>
      <p style="font-size: 16px; color: #555; margin: 5px 0;">
        <strong>📅 Date:</strong> [Date]<br>
        <strong>🕐 Time:</strong> [Time]<br>
        <strong>📍 Location:</strong> [Location/Online]
      </p>
    </td>
  </tr>
</table>
<p style="font-size: 16px; line-height: 1.6; color: #555;">
  Join us for an unforgettable night of music and community. Whether you're tuning in online or joining us in person, this is an event you won't want to miss!
</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
  <tr>
    <td style="background-color: #6f42c1; border-radius: 5px;">
      <a href="#" style="display: inline-block; padding: 12px 24px; color: white; text-decoration: none; font-weight: bold;">
        RSVP Now
      </a>
    </td>
  </tr>
</table>`
  },
  {
    id: 'featured-artist',
    name: 'Featured Artist',
    description: 'Spotlight on a DJ or producer',
    icon: <Star className="w-5 h-5" />,
    content: `<h2 style="color: #333; margin-bottom: 15px;">⭐ Artist Spotlight</h2>
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="text-align: center; padding: 20px;">
      <img src="[ARTIST_IMAGE_URL]" alt="Artist Photo" width="150" height="150" style="border-radius: 50%; border: 3px solid #007bff;">
    </td>
  </tr>
</table>
<h3 style="color: #333; text-align: center; margin: 15px 0;">[Artist Name]</h3>
<p style="font-size: 16px; line-height: 1.6; color: #555; text-align: center;">
  [Short bio about the artist and their contribution to the electronic music scene]
</p>
<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
<p style="font-size: 16px; line-height: 1.6; color: #555;">
  <strong>Recent Tracks:</strong>
</p>
<ul style="font-size: 16px; line-height: 1.8; color: #555; padding-left: 20px;">
  <li>[Track 1]</li>
  <li>[Track 2]</li>
  <li>[Track 3]</li>
</ul>`
  },
  {
    id: 'special-announcement',
    name: 'Special Announcement',
    description: 'Important news or updates',
    icon: <Gift className="w-5 h-5" />,
    content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
  <tr>
    <td style="padding: 30px; text-align: center;">
      <h2 style="color: white; margin: 0 0 15px 0;">🚀 Big News!</h2>
      <p style="font-size: 18px; color: white; margin: 0;">
        [Your exciting announcement here]
      </p>
    </td>
  </tr>
</table>
<p style="font-size: 16px; line-height: 1.6; color: #555; margin-top: 20px;">
  We're thrilled to share this news with our Dance One Radio family. [Expand on the announcement with more details...]
</p>
<p style="font-size: 16px; line-height: 1.6; color: #555;">
  Thank you for being part of our community. Your support means everything to us!
</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
  <tr>
    <td style="background-color: #007bff; border-radius: 5px;">
      <a href="https://danceoneradio.lovable.app" style="display: inline-block; padding: 12px 24px; color: white; text-decoration: none; font-weight: bold;">
        Learn More
      </a>
    </td>
  </tr>
</table>`
  },
  {
    id: 'simple-text',
    name: 'Simple Text',
    description: 'Clean, minimal text-only format',
    icon: <FileText className="w-5 h-5" />,
    content: `<h2 style="color: #333; margin-bottom: 15px;">Hello Dance One Family!</h2>
<p style="font-size: 16px; line-height: 1.6; color: #555;">
  [Your message here...]
</p>
<p style="font-size: 16px; line-height: 1.6; color: #555;">
  [Additional paragraphs as needed...]
</p>
<p style="font-size: 16px; line-height: 1.6; color: #555;">
  Keep dancing,<br>
  <strong>The Dance One Radio Team</strong>
</p>`
  }
];

interface NewsletterTemplateGalleryProps {
  onSelectTemplate: (content: string) => void;
  currentContent?: string;
}

const NewsletterTemplateGallery = ({ onSelectTemplate, currentContent }: NewsletterTemplateGalleryProps) => {
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  // Fetch custom templates on mount
  useEffect(() => {
    fetchCustomTemplates();
  }, []);

  const fetchCustomTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim() || !currentContent?.trim()) {
      toast.error('Template name and content are required');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('newsletter_templates')
        .insert({
          name: newTemplateName.trim(),
          description: newTemplateDescription.trim() || null,
          content: currentContent.trim(),
          created_by: user?.id || null,
        });

      if (error) throw error;

      toast.success('Template saved successfully!');
      setSaveDialogOpen(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
      fetchCustomTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(error.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setDeleting(templateId);
    try {
      const { error } = await supabase
        .from('newsletter_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Template deleted');
      setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'Failed to delete template');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card className="p-4 bg-muted/30 border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-['Orbitron'] font-semibold text-muted-foreground">
          Template Gallery
        </h3>
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 h-7 text-xs"
              disabled={!currentContent?.trim()}
            >
              <Save className="w-3 h-3" />
              Save Current
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-['Orbitron']">Save as Template</DialogTitle>
              <DialogDescription className="font-['Rajdhani']">
                Save your current newsletter content as a reusable template.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Template Name *</label>
                <Input
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g., Monthly Update"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description (optional)</label>
                <Input
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Brief description of when to use this template"
                  maxLength={200}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} disabled={saving || !newTemplateName.trim()}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Template'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="builtin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="builtin" className="text-xs">
            Built-in ({builtInTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs">
            My Templates ({customTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builtin" className="mt-2">
          <ScrollArea className="h-[180px]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {builtInTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-auto flex-col items-start gap-1 p-3 text-left hover:bg-primary/10 hover:border-primary/50"
                  onClick={() => onSelectTemplate(template.content)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-primary">{template.icon}</span>
                    <span className="font-['Orbitron'] text-xs font-medium truncate">
                      {template.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-['Rajdhani'] line-clamp-2">
                    {template.description}
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="custom" className="mt-2">
          <ScrollArea className="h-[180px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : customTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <BookTemplate className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground font-['Rajdhani']">
                  No custom templates yet
                </p>
                <p className="text-xs text-muted-foreground font-['Rajdhani']">
                  Create content and click "Save Current" to save a template
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {customTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="relative group"
                  >
                    <Button
                      variant="outline"
                      className="h-auto w-full flex-col items-start gap-1 p-3 text-left hover:bg-primary/10 hover:border-primary/50"
                      onClick={() => onSelectTemplate(template.content)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <BookTemplate className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-['Orbitron'] text-xs font-medium truncate">
                          {template.name}
                        </span>
                      </div>
                      {template.description && (
                        <span className="text-[10px] text-muted-foreground font-['Rajdhani'] line-clamp-2">
                          {template.description}
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-1 -right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      disabled={deleting === template.id}
                    >
                      {deleting === template.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <p className="text-[10px] text-muted-foreground mt-2 font-['Rajdhani']">
        Click a template to insert it. Replace bracketed placeholders with your content.
      </p>
    </Card>
  );
};

export default NewsletterTemplateGallery;
