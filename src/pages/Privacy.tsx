import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import SocialShare from '@/components/SocialShare';
import { Link } from 'react-router-dom';

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
            <h1 className="text-4xl font-['Orbitron'] font-bold text-primary mb-4 text-center">
              Privacy Policy
            </h1>
            <div className="flex justify-center mb-8">
              <SocialShare 
                url={window.location.href}
                title="Privacy Policy - Dance One Radio"
                description="Learn about how Dance One Radio protects and uses your personal information. Read our privacy policy for details on data collection and security."
                image={`${window.location.origin}/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png`}
              />
            </div>
            
            <GoogleAds key="privacy-ad" slot="6777392184" />
            
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
                <h2 className="text-2xl font-semibold text-accent mb-4">Legal Basis for Processing (GDPR)</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  For visitors from the European Economic Area (EEA), we process your personal data based on the following legal grounds:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Consent</strong>: When you subscribe to our newsletter or contact us</li>
                  <li><strong>Legitimate Interest</strong>: For streaming services, analytics, and website improvements</li>
                  <li><strong>Legal Obligation</strong>: When required to comply with applicable laws</li>
                </ul>
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
                <h2 className="text-2xl font-semibold text-accent mb-4">Your Rights Under GDPR</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you are located in the European Economic Area, you have the following rights regarding your personal data:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Right to Access</strong>: Request a copy of your personal data we hold</li>
                  <li><strong>Right to Rectification</strong>: Request correction of inaccurate or incomplete data</li>
                  <li><strong>Right to Erasure</strong>: Request deletion of your personal data ("Right to be Forgotten")</li>
                  <li><strong>Right to Restrict Processing</strong>: Request limitation on how we use your data</li>
                  <li><strong>Right to Data Portability</strong>: Receive your data in a structured, commonly used format</li>
                  <li><strong>Right to Object</strong>: Object to processing based on legitimate interests</li>
                  <li><strong>Right to Withdraw Consent</strong>: Withdraw consent at any time (e.g., unsubscribe from newsletter)</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise any of these rights, please{' '}
                  <Link to="/contact" className="text-primary hover:text-primary/80 underline">
                    contact us
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We retain your personal information only as long as necessary for the purposes stated in this policy:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Newsletter Subscriptions</strong>: Until you unsubscribe, plus 30 days for processing</li>
                  <li><strong>Contact Messages</strong>: Up to 12 months or as long as needed to respond to your inquiry</li>
                  <li><strong>Analytics Data</strong>: Anonymized after 90 days</li>
                  <li><strong>Streaming Logs</strong>: Deleted after 7 days</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Essential Cookies</strong>: Required for streaming functionality and security</li>
                  <li><strong>Analytics Cookies</strong>: Help us understand how visitors use our website</li>
                  <li><strong>Advertising Cookies</strong>: Google AdSense may place cookies for personalized ads</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You can control cookies through your browser settings. Note that disabling certain cookies may affect website functionality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your data may be transferred to and processed in countries outside the European Economic Area. 
                  We ensure appropriate safeguards are in place through Standard Contractual Clauses (SCCs) approved 
                  by the European Commission and compliance with the EU-U.S. Data Privacy Framework where applicable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction. This includes 
                  encryption, secure servers, and regular security assessments. However, no method of transmission 
                  over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not directed at children under the age of 16. We do not knowingly collect personal 
                  information from children under 16. If you believe we have collected information from a child under 16, 
                  please contact us immediately at privacy@danceoneradio.com
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website may contain links to third-party websites or services (including social media platforms, 
                  streaming services, and advertising networks). We are not responsible for the privacy practices of 
                  these external sites. We encourage you to read their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Updates to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                  We will notify you of any material changes by posting the updated policy on this page and updating the 
                  "Last updated" date. For significant changes affecting GDPR rights, we will provide additional notice 
                  through our newsletter or website banner.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or wish to exercise your GDPR rights, please visit our{' '}
                  <Link to="/contact" className="text-primary hover:text-primary/80 underline font-semibold">
                    Contact Us page
                  </Link>
                  .
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You also have the right to lodge a complaint with your local data protection authority if you believe 
                  we have not handled your personal data in accordance with GDPR requirements.
                </p>
              </section>

              <div className="text-sm text-muted-foreground/80 mt-12 pt-8 border-t border-primary/20">
                Last updated: October 2025
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