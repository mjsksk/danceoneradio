import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import AdSenseUnit from '@/components/AdSenseUnit';
import SocialShare from '@/components/SocialShare';
const Dmca = () => {
  return <div className="min-h-screen bg-background">
      <SEO 
        title="DMCA Policy - Dance One Radio"
        description="Digital Millennium Copyright Act policy for Dance One Radio. Learn about our copyright protection practices and procedures."
      />
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-4 font-['Orbitron']">
            Digital Millennium Copyright Act Policy
          </h1>
          <div className="flex justify-center mb-8">
            <SocialShare 
              url={window.location.href}
              title="DMCA Policy - Dance One Radio"
              description="Digital Millennium Copyright Act policy for Dance One Radio. Learn about our copyright protection practices and procedures."
              image={`${window.location.origin}/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png`}
            />
          </div>
          
          <AdSenseUnit />
          
          <div className="bg-card/50 border border-primary/20 rounded-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4 font-['Orbitron']">
                Scope and Application of this Digital Millennium Copyright Act Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed font-['Rajdhani'] text-lg">
                This Digital Millennium Copyright Act Policy (this "Policy" or "DMCA Policy") only applies to copyright-protected content or material that is owned by Digital One LLC and/or Dance One Radio (collectively, the "Company") or which is made assessable through the Company's stream services.
              </p>
            </section>

            <section>
              <p className="text-muted-foreground leading-relaxed font-['Rajdhani'] text-lg">
                This DMCA Policy does not apply to any third-party content or material that may be accessible through other services and the Company does not own or control content or material hosted on third-party sites or sources and cannot modify or remove content from such sites or sources.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4 font-['Orbitron']">
                Accommodation of Standard Technical Measures
              </h2>
              <p className="text-muted-foreground leading-relaxed font-['Rajdhani'] text-lg">
                By Section 512(i)(1)(b) of the DMCA, it is the Company's policy to accommodate and not interfere with standard technical measures used by copyright owners to identify or protect copyrighted works that the Company determines are reasonable under the circumstances.
              </p>
            </section>

            <section className="mt-8 pt-6 border-t border-primary/20">
              
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};
export default Dmca;