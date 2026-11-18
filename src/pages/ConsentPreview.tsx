import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { UserRound, Monitor, ChevronDown, ArrowLeft, RotateCcw } from 'lucide-react';

// Presentation only: never invokes Google's CMP or writes a consent choice.
export default function ConsentPreview() {
  const [view, setView] = useState<'choice' | 'settings' | 'done'>('choice');
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto mb-6 flex max-w-2xl items-center justify-between gap-3">
        <Link to="/" className="text-primary text-sm">← Dance One Radio</Link>
        <span className="text-muted-foreground text-sm">European consent preview</span>
      </div>
      {view === 'done' ? (
        <div className="mx-auto max-w-2xl text-center text-foreground">
          <Button variant="outline" onClick={() => setView('choice')}><RotateCcw className="mr-2 h-4 w-4" />Preview again</Button>
        </div>
      ) : (
        <div className="fc-consent-root consent-design-preview">
          <section className="fc-dialog fc-choice-dialog mx-auto" aria-label="European consent preview">
            <div className="fc-dialog-content">
              <div className="fc-dialog-scrollable-content">
                <div className="fc-header-image-container text-center">
                  <img className="fc-header-image mx-auto" src="/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662-480w.webp" alt="Dance One Radio" />
                </div>
                <h1 className="fc-dialog-headline text-center mb-6">{view === 'settings' ? 'Manage your data' : 'Dance One Radio asks for your consent to use your personal data to:'}</h1>
                {view === 'settings' ? (
                  <div className="space-y-5">
                    <Button variant="ghost" onClick={() => setView('choice')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                    <div className="flex justify-between gap-4"><p>Necessary</p><span>Always active</span></div>
                    <div className="flex justify-between gap-4"><p>Analytics</p><Switch aria-label="Analytics" checked={analytics} onCheckedChange={setAnalytics} /></div>
                    <div className="flex justify-between gap-4"><p>Advertising</p><Switch aria-label="Advertising" checked={advertising} onCheckedChange={setAdvertising} /></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-4 mb-5"><UserRound className="h-6 w-6 shrink-0 text-primary" /><p className="fc-stack-name">Personalised advertising and content, advertising and content measurement, audience research and services development</p></div>
                    <div className="flex items-start gap-4 mb-5"><Monitor className="h-6 w-6 shrink-0 text-primary" /><p className="fc-stack-name">Store and/or access information on a device</p></div>
                    <Button variant="ghost" className="fc-faq-header mb-3" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}><ChevronDown className="mr-3 h-5 w-5" />Learn more</Button>
                    {expanded && <p className="mb-4">You can manage your choices for each purpose and vendor in Manage options.</p>}
                    <p className="mb-3">Your personal data will be processed and information from your device (cookies, unique identifiers, and other device data) may be stored by, accessed by and shared with partners, or used specifically by this site. We and our partners may use precise geolocation data.</p>
                    <p>Some vendors may process your personal data on the basis of legitimate interest, which you can object to by managing your options below. Look for a link at the bottom of this page or in the site menu to manage or withdraw consent in privacy and cookie settings.</p>
                  </>
                )}
              </div>
            </div>
            <div className="fc-footer-buttons-container">
              <div className="fc-footer-buttons">
                {view === 'settings' ? <Button className="fc-button fc-primary-button" onClick={() => setView('done')}><span className="fc-button-label">Confirm choices</span></Button> : <>
                  <Button className="fc-button fc-cta-consent fc-primary-button" onClick={() => setView('done')}><span className="fc-button-label">Consent</span></Button>
                  <Button className="fc-button fc-cta-do-not-consent fc-secondary-button" onClick={() => setView('done')}><span className="fc-button-label">Do not consent</span></Button>
                </>}
              </div>
              {view === 'choice' && <Button className="fc-button fc-cta-manage-options" onClick={() => setView('settings')}><span className="fc-manage-options-third-button-label">Manage options</span></Button>}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
