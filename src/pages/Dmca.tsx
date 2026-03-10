import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
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
            Digital Millennium Copyright Act (DMCA) Policy
          </h1>
          
          <p className="text-xl text-primary/80 mb-6 font-['Rajdhani']">Dance One Radio</p>
          
          <div className="flex justify-center mb-8">
            <SocialShare 
              url={window.location.href}
              title="DMCA Policy - Dance One Radio"
              description="Digital Millennium Copyright Act policy for Dance One Radio. Learn about our copyright protection practices and procedures."
              image={`${window.location.origin}/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png`}
            />
          </div>
          
          <GoogleAds key="dmca-ad" slot="6777392184" />
          
          <div className="bg-card/50 border border-primary/20 rounded-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4 font-['Orbitron']">
                1. Purpose and Scope
              </h2>
              <p className="text-muted-foreground leading-relaxed font-['Rajdhani'] text-lg mb-4">
                This Digital Millennium Copyright Act ("DMCA") Policy ("Policy") applies solely to copyright-protected audio, music, artwork, metadata, and related content that is owned by Dance One Radio (collectively, the "Company"), or that is made available through the Company's streaming platforms, websites, mobile apps, or related services ("Services").
              </p>
              <p className="text-muted-foreground leading-relaxed font-['Rajdhani'] text-lg">
                This Policy does not apply to any third-party content that may be accessible through external links, third-party platforms, or user-submitted sources not operated or controlled by the Company. The Company does not host, manage, or control content located on any third-party sites and therefore cannot alter, remove, or disable access to content on such external platforms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4 font-['Orbitron']">
                2. The Company's Role and Limitations
              </h2>
              <p className="text-muted-foreground leading-relaxed font-['Rajdhani'] text-lg mb-4">
                Dance One Radio is a music broadcasting and streaming platform. While the Company curates and broadcasts music, it does not claim ownership over third-party music copyrights unless explicitly stated. All copyrighted tracks remain the property of their respective copyright holders.
              </p>
              <p className="text-muted-foreground leading-relaxed font-['Rajdhani'] text-lg mb-4">
                The Company operates as a DMCA-compliant online radio service, relying on licensing frameworks, performance rights organizations, and appropriate broadcast reporting where applicable. The Company responds promptly to valid DMCA notices regarding material we host, but cannot take action regarding:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li className="text-muted-foreground font-['Rajdhani'] text-lg">Music hosted on other websites</li>
                <li className="text-muted-foreground font-['Rajdhani'] text-lg">User content stored outside Company-controlled systems</li>
                <li className="text-muted-foreground font-['Rajdhani'] text-lg">Infringing material you encountered on unrelated services</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed font-['Rajdhani'] text-lg">
                For such issues, copyright holders must contact the hosting provider directly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4 font-['Orbitron']">
                3. Standard Technical Measures
              </h2>
              <p className="text-muted-foreground leading-relaxed font-['Rajdhani'] text-lg mb-4">
                In accordance with 17 U.S.C. §512(i)(1)(B) of the DMCA, the Company will accommodate and will not interfere with industry-standard technical measures used by copyright owners to identify, watermark, fingerprint, or protect copyrighted musical works—provided such measures:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li className="text-muted-foreground font-['Rajdhani'] text-lg">Are commonly recognized in the broadcasting and streaming industry</li>
                <li className="text-muted-foreground font-['Rajdhani'] text-lg">Do not impose unreasonable burdens on the Company's infrastructure</li>
                <li className="text-muted-foreground font-['Rajdhani'] text-lg">Do not compromise the security, availability, or performance of the Services</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed font-['Rajdhani'] text-lg mt-4">
                The Company maintains systems designed to respect and support such standard technical measures wherever reasonably feasible.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};
export default Dmca;