import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import GoogleAds from "@/components/GoogleAds";
import SocialShare from "@/components/SocialShare";
import { Card, CardContent } from "@/components/ui/card";
import { Radio, Music, Users, Headphones, Globe, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO 
        title="About Dance One Radio - Electronic Dance Music Station"
        description="Learn about Dance One Radio's history, mission, and the passionate team behind your favorite electronic dance music station. Discover our story and join our global community."
        keywords="about dance one radio, electronic dance music station, edm radio history, dance music community, mario dj, future dance anthems"
        type="website"
      />
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold font-['Orbitron'] mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                About Dance One Radio
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-['Rajdhani'] mb-8">
                Your Destination for Electronic Dance Music
              </p>
              <SocialShare 
                url={typeof window !== 'undefined' ? window.location.href : 'https://danceoneradio.live/about'}
                title="About Dance One Radio" 
                description="Discover the story behind Dance One Radio - your premier electronic dance music station."
              />
            </div>
          </div>
        </section>

        <GoogleAds slot="1234567890" format="horizontal" className="my-8" />

        {/* Our Story Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Card className="card-cyber border-primary/30">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Radio className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] text-primary">
                    Our Story
                  </h2>
                </div>
                <div className="prose prose-lg max-w-none text-foreground/90 font-['Rajdhani'] space-y-4">
                  <p>
                    Dance One Radio was born from a deep passion for electronic dance music and a vision to create a global platform where music lovers could connect through the universal language of beats and rhythms. What started as a dream to share the electrifying sounds of house, trance, and progressive music has evolved into a thriving online radio station that reaches listeners across continents.
                  </p>
                  <p>
                    Since our inception, we have been committed to curating the finest electronic dance music, from underground gems to chart-topping anthems. Our journey has been fueled by the unwavering support of our dedicated listeners and the talented artists who trust us to share their music with the world. Today, Dance One Radio stands as a beacon for electronic music enthusiasts, offering 24/7 streaming of carefully selected tracks that move both body and soul.
                  </p>
                  <p>
                    Our flagship podcast, "Future Dance Anthems with Mario," has become a weekly ritual for thousands of listeners worldwide, featuring the hottest new releases and timeless classics that define the electronic dance music landscape. Each episode is crafted with precision and passion, ensuring that our audience experiences the best that the genre has to offer.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <Card className="card-cyber border-accent/30">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-full bg-accent/20">
                    <Heart className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] text-accent">
                    Our Mission
                  </h2>
                </div>
                <div className="prose prose-lg max-w-none text-foreground/90 font-['Rajdhani'] space-y-4">
                  <p>
                    At Dance One Radio, our mission is simple yet profound: to deliver the highest quality electronic dance music experience to listeners around the globe, completely free of charge. We believe that great music should be accessible to everyone, regardless of geographical boundaries or economic circumstances.
                  </p>
                  <p>
                    We are dedicated to fostering a vibrant community of music enthusiasts who share our passion for electronic beats. Through our platform, we aim to connect artists with audiences, introduce listeners to new sounds, and create memorable musical experiences that transcend the ordinary. Our commercial-free streaming ensures that your journey through our soundscapes remains uninterrupted and immersive.
                  </p>
                  <p>
                    Beyond entertainment, we strive to support emerging artists by giving them a platform to showcase their talents alongside established names in the industry. Dance One Radio is more than just a radio station—it's a movement dedicated to the celebration and advancement of electronic dance music culture.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <GoogleAds slot="0987654321" format="rectangle" className="my-8" />

        {/* Meet the Team Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] text-primary">
                  Meet the Team
                </h2>
              </div>
              <p className="text-muted-foreground font-['Rajdhani'] text-lg max-w-2xl mx-auto">
                The passionate individuals who bring Dance One Radio to life every single day
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Mario */}
              <Card className="card-cyber border-primary/30 overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src="/lovable-uploads/mario-show.jpg" 
                      alt="Mario - Host of Future Dance Anthems"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold font-['Orbitron'] text-primary mb-2">Mario</h3>
                    <p className="text-accent font-['Rajdhani'] text-lg mb-4">Host of Future Dance Anthems</p>
                    <p className="text-foreground/80 font-['Rajdhani']">
                      Mario is the driving force behind Dance One Radio and the voice of "Future Dance Anthems." With an encyclopedic knowledge of electronic dance music and an ear for the next big track, Mario curates each episode with meticulous attention to detail. His weekly podcast has become essential listening for dance music aficionados worldwide, featuring exclusive premieres and carefully selected tracks that define the cutting edge of electronic music. Mario's passion for the genre is infectious, and his dedication to quality has established Dance One Radio as a trusted source for the best in electronic dance music.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ivan Samel */}
              <Card className="card-cyber border-accent/30 overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src="/lovable-uploads/ivan-samel.jpg" 
                      alt="Ivan Samel - Sound Engineer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold font-['Orbitron'] text-accent mb-2">Ivan Samel</h3>
                    <p className="text-primary font-['Rajdhani'] text-lg mb-4">Sound Engineer - "EQ Wave Magician"</p>
                    <p className="text-foreground/80 font-['Rajdhani']">
                      Behind every crystal-clear broadcast and perfectly balanced mix stands Ivan Samel, our resident sound engineering wizard. Known affectionately as the "EQ Wave Magician," Ivan ensures that every track played on Dance One Radio sounds exactly as the artist intended—rich, dynamic, and immersive. His technical expertise and artistic sensibility combine to create an audio experience that rivals professional studio quality. Ivan's dedication to sonic perfection means that whether you're listening on high-end speakers or casual earbuds, you'll always experience Dance One Radio at its best.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What We Play Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Music className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] text-primary">
                  What We Play
                </h2>
              </div>
              <p className="text-muted-foreground font-['Rajdhani'] text-lg max-w-2xl mx-auto">
                A diverse spectrum of electronic dance music genres, carefully curated for your listening pleasure
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  genre: "Progressive House",
                  description: "Characterized by its melodic build-ups and euphoric drops, progressive house takes you on an emotional journey through sound. From the subtle beginnings to the powerful climaxes, this genre exemplifies the art of musical storytelling."
                },
                {
                  genre: "Deep House",
                  description: "Smooth, soulful, and sophisticated—deep house combines jazzy chords, warm basslines, and atmospheric textures. Perfect for late-night listening or creating an ambient atmosphere that moves both mind and body."
                },
                {
                  genre: "Trance",
                  description: "Uplifting melodies, driving beats, and transcendent breakdowns define this beloved genre. Trance music is designed to elevate your consciousness and transport you to a state of pure musical euphoria."
                },
                {
                  genre: "Techno",
                  description: "Raw, hypnotic, and powerfully rhythmic—techno is the backbone of electronic dance culture. From Detroit's origins to Berlin's underground clubs, techno continues to push boundaries and define the future of dance music."
                },
                {
                  genre: "EDM & Big Room",
                  description: "Festival-ready anthems with massive drops and crowd-moving energy. EDM represents the mainstream celebration of electronic music, bringing together millions of fans at events worldwide."
                },
                {
                  genre: "Melodic Techno",
                  description: "Blending the driving force of techno with emotional melodies, this genre creates deeply immersive sonic landscapes. Artists like Tale Of Us and Anyma have pioneered this captivating sound."
                }
              ].map((item, index) => (
                <Card key={index} className="card-cyber border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold font-['Orbitron'] text-primary mb-3">{item.genre}</h3>
                    <p className="text-foreground/80 font-['Rajdhani']">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <GoogleAds slot="1122334455" format="horizontal" className="my-8" />

        {/* Listen Anywhere Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Card className="card-cyber border-primary/30">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Headphones className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] text-primary">
                    Listen Anywhere
                  </h2>
                </div>
                <div className="prose prose-lg max-w-none text-foreground/90 font-['Rajdhani'] space-y-4">
                  <p>
                    Dance One Radio is available wherever you are, whenever you want to listen. Our multi-platform approach ensures that your favorite electronic dance music is always just a tap or click away.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80">
                    <li><strong>Web Player:</strong> Stream directly from our website with our sleek, responsive player that works on any browser.</li>
                    <li><strong>Mobile Apps:</strong> Download our apps for iOS and Android to take Dance One Radio with you on the go.</li>
                    <li><strong>Desktop Application:</strong> Install our dedicated desktop app for Windows for a seamless listening experience on your computer.</li>
                    <li><strong>Podcast:</strong> Subscribe to "Future Dance Anthems with Mario" on Apple Podcasts and never miss an episode.</li>
                  </ul>
                  <p>
                    No matter how you choose to listen, you'll always receive the same high-quality audio stream that Dance One Radio is known for. Join thousands of listeners worldwide who have made us their go-to source for electronic dance music.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Join Our Community Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <Card className="card-cyber border-accent/30">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="p-3 rounded-full bg-accent/20">
                    <Globe className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] text-accent">
                    Join Our Community
                  </h2>
                </div>
                <div className="prose prose-lg max-w-3xl mx-auto text-foreground/90 font-['Rajdhani'] space-y-4">
                  <p>
                    Dance One Radio is more than just a radio station—it's a global community of music lovers united by their passion for electronic dance music. Connect with us on social media, subscribe to our newsletter, and become part of a family that celebrates the transformative power of music.
                  </p>
                  <p>
                    Follow us on Instagram, Facebook, YouTube, and X (Twitter) for the latest updates, exclusive content, behind-the-scenes glimpses, and announcements about new releases. Your support helps us continue to bring you the best electronic dance music from around the world.
                  </p>
                  <p className="text-xl font-semibold text-primary">
                    Thank you for being part of the Dance One Radio family. Together, we dance as one.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;