import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Heart, Music, Radio, Users } from 'lucide-react';

const Love = () => {
  return <div className="min-h-screen bg-background text-foreground">
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

              <div className="card-cyber p-8 mt-12 text-center bg-primary/5">
                <h3 className="text-2xl font-semibold text-primary mb-4">Share the Love</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Support Dance One Radio and help us continue bringing you the best electronic music experience.
                </p>
                
                <div className="space-y-6">
                  {/* Premium Support Form */}
                  <div className="card-cyber p-4 bg-background/50">
                    <h4 className="text-lg font-semibold text-accent mb-3">Premium Support</h4>
                    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                      <input type="hidden" name="cmd" value="_s-xclick" />
                      <input type="hidden" name="hosted_button_id" value="X3SUYFT3YSG5S" />
                      <table className="mx-auto">
                        <tr>
                          <td>
                            <input type="hidden" name="on0" value="Payment Options" />
                            <label className="text-muted-foreground mb-2 block">Payment Options</label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <select name="os0" className="mb-4 p-2 border border-border rounded bg-background text-foreground">
                              <option value="Option 1">
                                Option 1 $15.00 USD - month(s)
                              </option>
                              <option value="Option 2">
                                Option 2 $20.00 USD - month(s)
                              </option>
                              <option value="Option 3">
                                Option 3 $30.00 USD - month(s)
                              </option>
                            </select>
                          </td>
                        </tr>
                      </table>
                      <input type="hidden" name="currency_code" value="USD" />
                      <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_subscribeCC_LG.gif" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Subscribe" className="border-0" />
                    </form>
                  </div>

                  {/* Standard Support Form */}
                  <div className="card-cyber p-4 bg-background/50">
                    <h4 className="text-lg font-semibold text-accent mb-3">Standard Support</h4>
                    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                      <input type="hidden" name="cmd" value="_s-xclick" />
                      <input type="hidden" name="hosted_button_id" value="8KHUB494QFKYS" />
                      <table className="mx-auto">
                        <tr>
                          <td>
                            <input type="hidden" name="on0" value="Payment Options" />
                            <label className="text-muted-foreground mb-2 block">Payment Options</label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <select name="os0" className="mb-4 p-2 border border-border rounded bg-background text-foreground">
                              <option value="Option 1">
                                Option 1 $1.00 USD - month(s)
                              </option>
                              <option value="Option 2">
                                Option 2 $5.00 USD - month(s)
                              </option>
                              <option value="Option 3">
                                Option 3 $10.00 USD - month(s)
                              </option>
                            </select>
                          </td>
                        </tr>
                      </table>
                      <input type="hidden" name="currency_code" value="USD" />
                      <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_subscribe_LG.gif" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Subscribe" className="border-0" />
                    </form>
                  </div>

                  {/* Quick Support Form */}
                  <div className="card-cyber p-4 bg-background/50">
                    <h4 className="text-lg font-semibold text-accent mb-3">Quick Support</h4>
                    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                      <input type="hidden" name="cmd" value="_s-xclick" />
                      <input type="hidden" name="hosted_button_id" value="DK3YAZ6D4WGGU" />
                      <input type="hidden" name="currency_code" value="USD" />
                      <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_subscribe_LG.gif" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Subscribe" className="border-0" />
                    </form>
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  <Heart className="w-6 h-6 text-primary animate-pulse" />
                  <Music className="w-6 h-6 text-accent" />
                  <Heart className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>;
};
export default Love;