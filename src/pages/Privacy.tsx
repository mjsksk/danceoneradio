import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import AdSenseUnit from '@/components/AdSenseUnit';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO 
        title="Privacy Policy - Dance One Radio"
        description="Learn about how Dance One Radio protects and uses your personal information. Read our privacy policy for details on data collection and security."
      />
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="card-cyber p-8">
            <h1 className="text-4xl font-['Orbitron'] font-bold text-primary mb-8 text-center">
              Privacy Policy
            </h1>
            
            <AdSenseUnit />
            
            <div className="space-y-8 font-['Rajdhani'] text-lg">
              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At Dance One Radio, we collect minimal information to provide you with the best listening experience. 
                  This may include your IP address for streaming purposes, email address if you subscribe to our newsletter, 
                  and anonymous usage data to improve our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use collected information solely to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                  <li>Provide uninterrupted streaming services</li>
                  <li>Send you updates about new shows and exclusive content (only if you opt-in)</li>
                  <li>Improve our website and streaming quality</li>
                  <li>Respond to your inquiries and support requests</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized 
                  access, alteration, disclosure, or destruction. However, no method of transmission over the internet 
                  is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website may contain links to third-party websites or services. We are not responsible for the 
                  privacy practices of these external sites. We encourage you to read their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at privacy@danceoneradio.com
                </p>
              </section>

              <div className="text-sm text-muted-foreground/80 mt-12 pt-8 border-t border-primary/20">
                Last updated: January 2024
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;