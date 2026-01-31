import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Music, Calendar, Newspaper, Star, Gift } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  content: string;
}

const templates: Template[] = [
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
}

const NewsletterTemplateGallery = ({ onSelectTemplate }: NewsletterTemplateGalleryProps) => {
  return (
    <Card className="p-4 bg-muted/30 border-border/50">
      <h3 className="text-sm font-['Orbitron'] font-semibold mb-3 text-muted-foreground">
        Template Gallery
      </h3>
      <ScrollArea className="h-[200px]">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {templates.map((template) => (
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
      <p className="text-[10px] text-muted-foreground mt-2 font-['Rajdhani']">
        Click a template to insert it. Replace bracketed placeholders with your content.
      </p>
    </Card>
  );
};

export default NewsletterTemplateGallery;
