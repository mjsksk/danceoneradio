import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
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
              <p className="text-xl text-muted-foreground font-['Rajdhani']">Dance One is operating its streams commercial-free. We are able to do that with your help, our listeners. 


 All donations go directly into helping the station operate on a non-commercial basis. Your money will help pay for anything that has to do with expenses for hardware, software, streamlining, development, and music licensing. If you appreciate all the hard work that goes into making this station one of the best dance radio stations on earth, please consider a donation using one of the PayPal options below. 


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
                <h2 className="text-3xl font-semibold text-accent mb-6">The Experience</h2>
                
              </section>

              <div className="card-cyber p-8 mt-12 text-center bg-primary/5">
                <h3 className="text-2xl font-semibold text-primary mb-4">Share the Love</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Music is meant to be shared. Tell your friends, family, and fellow music lovers about Dance One Radio. 
                  Let's spread the love for electronic music together!
                </p>
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