import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  ContainerAnimated,
  ContainerScroll,
  ContainerStagger,
  ContainerSticky,
  GalleryCol,
  GalleryContainer 
} from "@/components/ui/animated-gallery";
import { Button } from "@/components/ui/button";
import { Radio, Heart, Star } from "lucide-react";

// Sample images - replace with your actual radio station photos
const IMAGES_1 = [
  "/lovable-uploads/054c29a7-1e20-4801-8426-fd378cd3d2bb.png",
  "/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png",
  "/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png",
  "/lovable-uploads/72d04e54-23af-4f4a-bf39-efcc6c6b2150.png",
];

const IMAGES_2 = [
  "/lovable-uploads/ba6a92fa-e132-4643-8d4c-abc0bab124f1.png",
  "/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png",
  "/lovable-uploads/f807b27f-9eaf-4d20-b3f5-4bad24538a4e.png",
  "/lovable-uploads/054c29a7-1e20-4801-8426-fd378cd3d2bb.png",
];

const IMAGES_3 = [
  "/lovable-uploads/1aabd155-f35e-415e-981a-c390b613e662.png",
  "/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png",
  "/lovable-uploads/72d04e54-23af-4f4a-bf39-efcc6c6b2150.png",
  "/lovable-uploads/ba6a92fa-e132-4643-8d4c-abc0bab124f1.png",
];

const Gallery = () => {
  return (
    <>
      <SEO 
        title="Gallery - Dance One Radio"
        description="Explore our vibrant gallery showcasing the best moments from Dance One Radio. From live DJ sets to behind-the-scenes moments, discover our journey in electronic music."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="relative bg-background">
          <ContainerStagger className="relative z-[9999] -mb-12 place-self-center px-6 pt-24 text-center">
            <ContainerAnimated>
              <h1 className="font-['Orbitron'] text-4xl font-bold text-cyber-blue md:text-6xl">
                Our{" "}
                <span className="bg-gradient-neon bg-clip-text text-transparent">
                  Journey
                </span>
              </h1>
            </ContainerAnimated>
            <ContainerAnimated>
              <h2 className="font-['Orbitron'] text-3xl font-light text-foreground md:text-4xl mt-2">
                in Electronic Music
              </h2>
            </ContainerAnimated>

            <ContainerAnimated className="my-6">
              <p className="leading-relaxed tracking-wide text-muted-foreground max-w-2xl mx-auto">
                From intimate studio sessions to explosive live performances,
                <br /> 
                witness the passion behind Dance One Radio's sound.
              </p>
            </ContainerAnimated>

            <ContainerAnimated>
              <Button className="btn-cyber gap-2 mr-4">
                <Radio className="size-4" />
                Listen Live
              </Button>
              <Button variant="ghost" className="text-cyber-blue hover:text-electric-purple">
                <Heart className="size-4 mr-2" />
                Support Us
              </Button>
            </ContainerAnimated>
          </ContainerStagger>

          {/* Cyber glow effect */}
          <div 
            className="pointer-events-none absolute z-10 h-[70vh] w-full opacity-30"
            style={{
              background: "var(--gradient-cyber)",
              filter: "blur(100px)",
              mixBlendMode: "screen",
            }}
          />

          <ContainerScroll className="relative h-[350vh]">
            <ContainerSticky className="h-svh">
              <GalleryContainer className="p-4">
                <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
                  {IMAGES_1.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        className="aspect-video block h-auto max-h-full w-full rounded-lg object-cover shadow-lg card-cyber transition-all duration-300 group-hover:shadow-glow-cyber"
                        src={imageUrl}
                        alt={`Dance One Radio gallery moment ${index + 1}`}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end p-4">
                        <div className="flex items-center gap-2 text-cyber-blue">
                          <Star className="size-4" />
                          <span className="text-sm font-medium">Featured Moment</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </GalleryCol>
                <GalleryCol className="mt-[-50%]" yRange={["15%", "5%"]}>
                  {IMAGES_2.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        className="aspect-video block h-auto max-h-full w-full rounded-lg object-cover shadow-lg card-cyber transition-all duration-300 group-hover:shadow-glow-purple"
                        src={imageUrl}
                        alt={`Dance One Radio behind the scenes ${index + 1}`}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end p-4">
                        <div className="flex items-center gap-2 text-electric-purple">
                          <Radio className="size-4" />
                          <span className="text-sm font-medium">Behind the Scenes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </GalleryCol>
                <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
                  {IMAGES_3.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        className="aspect-video block h-auto max-h-full w-full rounded-lg object-cover shadow-lg card-cyber transition-all duration-300 group-hover:shadow-glow-neon"
                        src={imageUrl}
                        alt={`Dance One Radio community moment ${index + 1}`}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end p-4">
                        <div className="flex items-center gap-2 text-neon-green">
                          <Heart className="size-4" />
                          <span className="text-sm font-medium">Community Love</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </GalleryCol>
              </GalleryContainer>
            </ContainerSticky>
          </ContainerScroll>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default Gallery;