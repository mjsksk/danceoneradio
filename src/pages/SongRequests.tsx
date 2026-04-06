import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Music, Send, CheckCircle, ArrowLeft, Headphones } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SongRequests() {
  const [formData, setFormData] = useState({
    listener_name: '',
    email: '',
    artist_name: '',
    song_title: '',
    message: '',
    website: '', // honeypot
  });
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.listener_name.trim() || !formData.artist_name.trim() || !formData.song_title.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!acknowledged) {
      toast.error('Please acknowledge the disclaimer');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-song-request', {
        body: {
          listener_name: formData.listener_name.trim(),
          email: formData.email.trim(),
          artist_name: formData.artist_name.trim(),
          song_title: formData.song_title.trim(),
          message: formData.message.trim(),
          website: formData.website, // honeypot
          acknowledged,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <SEO
          title="Request Sent - Dance One Radio"
          description="Your song request has been submitted to Dance One Radio."
        />
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 pt-24 pb-16">
            <div className="max-w-lg mx-auto text-center">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-12 pb-10 px-8 space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-['Orbitron'] font-bold text-foreground">
                    Request Received!
                  </h1>
                  <p className="text-muted-foreground font-['Rajdhani'] text-lg">
                    Thanks for your request. Our team will review it shortly.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Requests are reviewed by our team and may be played during upcoming programming.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button onClick={() => { setIsSuccess(false); setFormData({ listener_name: '', email: '', artist_name: '', song_title: '', message: '', website: '' }); setAcknowledged(false); }} variant="outline">
                      <Send className="w-4 h-4 mr-2" />
                      Send Another
                    </Button>
                    <Button asChild>
                      <Link to="/">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Request a Song - Dance One Radio"
        description="Send your song request to Dance One Radio. We welcome requests, dedications, and shout-outs."
      />
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <Navigation />

        <main className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-['Orbitron'] font-bold text-foreground">
                Request a Song
              </h1>
              <p className="text-muted-foreground font-['Rajdhani'] text-lg max-w-md mx-auto">
                Tell us what you want to hear. We welcome requests, dedications, and shout-outs.
              </p>
              <p className="text-sm text-muted-foreground">
                Send your request to Dance One Radio. We review every request, but submission does not guarantee airplay.
              </p>
            </div>

            {/* Form */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-['Orbitron'] text-lg">
                  <Music className="w-5 h-5 text-primary" />
                  Your Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Honeypot - hidden from users */}
                  <div className="absolute -left-[9999px]" aria-hidden="true">
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="listener_name">
                        Your Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="listener_name"
                        name="listener_name"
                        value={formData.listener_name}
                        onChange={handleChange}
                        placeholder="Your name"
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (optional)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        maxLength={255}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="artist_name">
                        Artist Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="artist_name"
                        name="artist_name"
                        value={formData.artist_name}
                        onChange={handleChange}
                        placeholder="e.g. David Guetta"
                        maxLength={200}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="song_title">
                        Song Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="song_title"
                        name="song_title"
                        value={formData.song_title}
                        onChange={handleChange}
                        placeholder="e.g. Titanium"
                        maxLength={200}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message / Dedication <span className="text-muted-foreground text-xs">(optional, max 300 characters)</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Any shout-outs or dedications?"
                      maxLength={300}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.message.length}/300
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acknowledged"
                      checked={acknowledged}
                      onCheckedChange={(checked) => setAcknowledged(checked === true)}
                    />
                    <Label htmlFor="acknowledged" className="text-sm leading-relaxed cursor-pointer">
                      I understand that my request may not be played. <span className="text-destructive">*</span>
                    </Label>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info */}
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>Requests are reviewed by our team and may be played during upcoming programming.</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
