import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import AdSenseUnit from '@/components/AdSenseUnit';
import { Button } from '@/components/ui/button';
import { Heart, Music, Radio, Users } from 'lucide-react';

declare global {
  interface Window {
    PayPal?: {
      Donation: {
        Button: (config: any) => { render: (selector: string) => void };
      };
    };
  }
}

const Love = () => {
  useEffect(() => {
    // Load PayPal Donation SDK
    const script = document.createElement('script');
    script.src = 'https://www.paypalobjects.com/donate/sdk/donate-sdk.js';
    script.charset = 'UTF-8';
    script.async = true;
    script.onload = () => {
      if (window.PayPal && window.PayPal.Donation) {
        window.PayPal.Donation.Button({
          env: 'production',
          hosted_button_id: 'NBJRR3JBYUUKE',
          image: {
            src: 'https://pics.paypal.com/00/s/Yjk2NjRhM2UtNWM4MC00N2QxLWI2MGItZmFlN2E1MTY5Yzli/file.PNG',
            alt: 'Donate with PayPal button',
            title: 'PayPal - The safer, easier way to pay online!',
          }
        }).render('#donate-button');
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div className="min-h-screen bg-background text-foreground">
      <SEO 
        title="About Love Parade - Dance One Radio"
        description="Learn about the history of Love Parade, the iconic electronic music festival that celebrated peace, love, and electronic dance music."
        image="/assets/love-parade-2006.png"
        keywords="love parade, electronic music festival, techno parade, dance music history, Love Parade San Francisco"
      />
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="card-cyber p-8">
            <div className="text-center mb-12">
              <Heart className="w-20 h-20 text-primary mx-auto mb-6 animate-pulse" />
              <h1 className="text-4xl font-['Orbitron'] font-bold text-primary mb-4">
                Love
              </h1>
              <p className="text-xl text-muted-foreground font-['Rajdhani']">Dance One is operating its streams commercial-free. We can do that with your help, our listeners. All donations go directly into helping the station operate on a non-commercial basis. Your money will help cover expenses related to hardware, software, streamlining, development, and music licensing. 


 If you appreciate all the hard work that goes into making this station one of the best dance radio stations on earth, please consider a donation using one of the PayPal options below. 


 You can make the change, and we really appreciate it.</p>
             </div>
             
             {/* Share the Love Section - Moved under Love heading */}
             <div className="card-cyber p-8 mb-12 text-center bg-primary/5">
               <h3 className="text-2xl font-semibold text-primary mb-4">Share the Love</h3>
               <p className="text-muted-foreground leading-relaxed mb-6">
                 Support Dance One Radio and help us continue bringing you the best electronic music experience.
               </p>
               
                 <div className="space-y-6">
                   {/* Premium Support */}
                   <div className="card-cyber p-4 bg-background/50">
                     <h4 className="text-lg font-semibold text-accent mb-3">Premium Support</h4>
                     <p className="text-muted-foreground mb-4">Monthly subscriptions for dedicated supporters</p>
                     <form 
                       action="https://www.paypal.com/cgi-bin/webscr" 
                       method="post" 
                       target="paypal"
                       onSubmit={() => window.open('', 'paypal', 'scrollbars=yes,resizable=yes,toolbar=no,location=yes,directories=no,status=no,menubar=no,copyhistory=no,width=400,height=350')}
                       className="text-center"
                     >
                       <input type="hidden" name="cmd" value="_s-xclick" />
                       <input type="hidden" name="hosted_button_id" value="X3SUYFT3YSG5S" />
                       <div className="mb-4">
                         <input type="hidden" name="on0" value="Payment Options" />
                         <label className="text-muted-foreground mb-2 block">Choose Your Support Level</label>
                         <select 
                           name="os0" 
                           className="w-full max-w-xs p-2 border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary mb-4"
                         >
                           <option value="Option 1">$15.00 USD / month</option>
                           <option value="Option 2">$20.00 USD / month</option>
                           <option value="Option 3">$30.00 USD / month</option>
                         </select>
                       </div>
                       <input type="hidden" name="currency_code" value="USD" />
                       <Button 
                         type="submit"
                         className="btn-cyber w-full max-w-xs"
                       >
                         Subscribe with PayPal
                       </Button>
                     </form>
                   </div>

                   {/* Standard Support */}
                   <div className="card-cyber p-4 bg-background/50">
                     <h4 className="text-lg font-semibold text-accent mb-3">Standard Support</h4>
                     <p className="text-muted-foreground mb-4">Affordable monthly support options</p>
                     <form 
                       action="https://www.paypal.com/cgi-bin/webscr" 
                       method="post" 
                       target="paypal2"
                       onSubmit={() => window.open('', 'paypal2', 'scrollbars=yes,resizable=yes,toolbar=no,location=yes,directories=no,status=no,menubar=no,copyhistory=no,width=400,height=350')}
                       className="text-center"
                     >
                       <input type="hidden" name="cmd" value="_s-xclick" />
                       <input type="hidden" name="hosted_button_id" value="8KHUB494QFKYS" />
                       <div className="mb-4">
                         <input type="hidden" name="on0" value="Payment Options" />
                         <label className="text-muted-foreground mb-2 block">Choose Your Support Level</label>
                         <select 
                           name="os0" 
                           className="w-full max-w-xs p-2 border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary mb-4"
                         >
                           <option value="Option 1">$1.00 USD / month</option>
                           <option value="Option 2">$5.00 USD / month</option>
                           <option value="Option 3">$10.00 USD / month</option>
                         </select>
                       </div>
                       <input type="hidden" name="currency_code" value="USD" />
                       <Button 
                         type="submit"
                         className="btn-cyber w-full max-w-xs"
                       >
                         Subscribe with PayPal
                       </Button>
                     </form>
                   </div>

                   {/* Quick Support */}
                   <div className="card-cyber p-4 bg-background/50">
                     <h4 className="text-lg font-semibold text-accent mb-3">Quick Support</h4>
                     <p className="text-muted-foreground mb-4">One-time donation to show your appreciation</p>
                     <div className="text-center">
                       <div id="donate-button-container">
                         <div id="donate-button"></div>
                       </div>
                     </div>
                   </div>
                 </div>
               <div className="flex justify-center space-x-4 mt-6">
                 <Heart className="w-6 h-6 text-primary animate-pulse" />
                 <Music className="w-6 h-6 text-accent" />
                 <Heart className="w-6 h-6 text-primary animate-pulse" />
               </div>
             </div>
             
              <AdSenseUnit />
              
              <div className="space-y-12 font-['Rajdhani'] text-lg">
              <section className="text-center">
                <Music className="w-16 h-16 text-accent mx-auto mb-6" />
                <h2 className="text-3xl font-semibold text-accent mb-6">The Music</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We love the endless creativity and innovation in electronic dance music. From deep house to progressive trance, 
                  every beat tells a story, every melody creates an emotion, and every drop brings us together on the dancefloor of life.
                </p>
              </section>

              <section className="text-center">
                <Users className="w-16 h-16 text-accent mx-auto mb-6" />
                <h2 className="text-3xl font-semibold text-accent mb-6">The Community</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our listeners are the heartbeat of Dance One Radio. We love the diversity, passion, and unity that electronic 
                  music brings to people from all walks of life. Together, we create a global family connected by rhythm and melody.
                </p>
              </section>

              <section className="text-center">
                <Radio className="w-16 h-16 text-accent mx-auto mb-6" />
                <h2 className="text-3xl font-semibold text-accent mb-6">Official Merchandise</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Show your love for Dance One Radio with our exclusive merchandise collection. From stylish apparel to unique accessories, 
                  each item is designed with our signature aesthetic to help you represent the electronic music lifestyle wherever you go.
                </p>
                <Button asChild className="btn-cyber">
                  <a 
                    href="https://www.cafepress.com/shop/danceone/products?designId=91970401" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Shop Merchandise
                  </a>
                </Button>
              </section>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>;
};
export default Love;