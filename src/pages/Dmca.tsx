import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Dmca = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-['Orbitron'] font-bold text-primary mb-8">
            Digital Millennium Copyright Act Policy
          </h1>
          
          <div className="space-y-8 text-muted-foreground font-['Rajdhani'] leading-relaxed">
            <section>
              <h2 className="text-2xl font-['Orbitron'] font-semibold text-primary mb-4">
                Scope and Application of this Digital Millennium Copyright Act Policy
              </h2>
              <p className="text-lg">
                This Digital Millennium Copyright Act Policy (this "Policy" or "DMCA Policy") only applies to copyright-protected content or material that is owned by Digital One LLC and/or Dance One Radio (collectively, the "Company") or which is made assessable through the Company's stream services.
              </p>
              <p className="text-lg mt-4">
                This DMCA Policy does not apply to any third-party content or material that may be accessible through other services and
                The Company does not own or control content or material hosted on third-party sites or sources and cannot modify or remove content from such sites or sources.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-['Orbitron'] font-semibold text-primary mb-4">
                Accommodation of Standard Technical Measures
              </h2>
              <p className="text-lg">
                By Section 512(i)(1)(b) of the DMCA, it is the Company's policy to accommodate and not interfere with standard technical measures used by copyright owners to identify or protect copyrighted works that the Company determines are reasonable under the circumstances.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dmca;