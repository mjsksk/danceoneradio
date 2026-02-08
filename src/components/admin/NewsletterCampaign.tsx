import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Mail, Eye, EyeOff, Loader2, CheckCircle, Users } from 'lucide-react';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import NewsletterTemplateGallery from './NewsletterTemplateGallery';

const NewsletterCampaign = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ sent: number; total: number } | null>(null);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error('Please fill in both subject and content');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this newsletter to all active subscribers?\n\nSubject: ${subject}`
    );

    if (!confirmed) return;

    setSending(true);
    setLastResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('You must be logged in to send campaigns');
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('newsletter-campaign', {
        body: {
          subject: subject.trim(),
          content: content.trim(),
          sent_by: session.user.email,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to send campaign');
      }

      setLastResult({ sent: data.sent_count, total: data.total_subscribers });
      toast.success(`Newsletter sent to ${data.sent_count} subscribers!`);
      
      // Clear form after successful send
      setSubject('');
      setContent('');
      setShowPreview(false);
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      toast.error(error.message || 'Failed to send newsletter campaign');
    } finally {
      setSending(false);
    }
  };

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedPreviewHtml = useMemo(() => {
    const rawHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333;">Dance One Radio Newsletter</h1>
        </div>
        
        <div style="color: #666; font-size: 16px; line-height: 1.6;">
          ${content || '<em>Your content will appear here...</em>'}
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="text-align: center;">
          <a href="#" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-bottom: 20px;">
            Visit Dance One Radio
          </a>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          You're receiving this because you subscribed to Dance One Radio newsletter.<br>
          <a href="#" style="color: #007bff;">Unsubscribe</a> | 
          <a href="#" style="color: #007bff;">Visit our website</a>
        </p>
      </div>
    `;
    
    // Sanitize HTML while allowing safe formatting tags, images, tables, and styles
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'strong', 'em', 'br', 'hr', 'ul', 'ol', 'li', 'span', 'img', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'caption', 'colgroup', 'col', 'center', 'blockquote'],
      ALLOWED_ATTR: ['href', 'style', 'class', 'src', 'alt', 'width', 'height', 'border', 'cellpadding', 'cellspacing', 'align', 'valign', 'bgcolor', 'colspan', 'rowspan', 'target'],
      ALLOW_DATA_ATTR: false,
    });
  }, [content]);

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Send className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-['Orbitron'] font-bold text-neon-purple">
            Send Newsletter Campaign
          </h2>
        </div>
        {lastResult && (
          <Badge variant="secondary" className="font-['Rajdhani'] gap-1">
            <CheckCircle className="w-3 h-3" />
            Last: {lastResult.sent}/{lastResult.total} sent
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-sm font-['Orbitron'] mb-2 text-muted-foreground">
            Subject Line
          </label>
          <Input
            placeholder="Enter email subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="font-['Rajdhani']"
            disabled={sending}
          />
        </div>

        {/* Template Gallery */}
        <NewsletterTemplateGallery 
          onSelectTemplate={(templateContent) => {
            setContent(prev => prev ? `${prev}\n\n${templateContent}` : templateContent);
            toast.success('Template inserted! Edit the placeholders.');
          }}
          currentContent={content}
        />

        {/* Content */}
        <div>
          <label className="block text-sm font-['Orbitron'] mb-2 text-muted-foreground">
            Email Content (HTML supported)
          </label>
          <Textarea
            placeholder="Enter your newsletter content or select a template above..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="font-['Rajdhani'] min-h-[200px]"
            disabled={sending}
          />
          <p className="text-xs text-muted-foreground mt-1 font-['Rajdhani']">
            Tip: Use &lt;p&gt;, &lt;strong&gt;, &lt;a href="..."&gt;, &lt;img&gt;, &lt;table&gt; for formatting
          </p>
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-4 py-2 border-b border-border/50">
              <p className="text-sm font-['Orbitron'] text-muted-foreground">
                Email Preview
              </p>
              <p className="text-xs text-muted-foreground font-['Rajdhani']">
                Subject: {subject || '(no subject)'}
              </p>
            </div>
            <div 
              className="p-4"
              style={{ backgroundColor: '#ffffff' }}
              dangerouslySetInnerHTML={{ __html: sanitizedPreviewHtml }}
            />
          </div>
        )}

        {/* Send Button */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-['Rajdhani']">
            <Users className="w-4 h-4" />
            <span>Will be sent to all active subscribers</span>
          </div>
          <Button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !content.trim()}
            className="gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send Campaign
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NewsletterCampaign;
