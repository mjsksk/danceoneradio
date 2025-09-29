import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ContainerAnimated, ContainerScroll, ContainerStagger, ContainerSticky, GalleryCol, GalleryContainer } from "@/components/ui/animated-gallery";
import { Button } from "@/components/ui/button";
import { Radio, Heart, Star } from "lucide-react";

// Love Parade 2005 images
const IMAGES_1 = [
  "/lovable-uploads/456045ea-1b09-4d4a-a5b5-92feb3d9b232.png", 
  "/lovable-uploads/904ad015-6a99-4f89-9045-773a74fef249.png", 
  "/lovable-uploads/adebbaa6-a671-4552-92df-75fa9ee22e59.png", 
  "/lovable-uploads/e85e609a-ca18-49ba-a3d2-64056b100d75.png",
  "/lovable-uploads/DSCN2432.JPG",
  "/lovable-uploads/DSCN2436.JPG",
  "/lovable-uploads/DSCN2438.JPG"
];

const IMAGES_2 = [
  "/lovable-uploads/cb44467f-22aa-4065-b0c2-21e90051c6e0.png", 
  "/lovable-uploads/27372fc3-4a92-4713-b992-5044632d553c.png", 
  "/lovable-uploads/3d724d81-1a61-4f83-b45f-08d6bab09744.png",
  "/lovable-uploads/DSCN2435.JPG",
  "/lovable-uploads/DSCN2437.JPG",
  "/lovable-uploads/DSCN2441.JPG"
];

const IMAGES_3 = [
  "/lovable-uploads/085cba21-1654-4f82-98d4-fe637a0e7f50.png", 
  "/lovable-uploads/5c460280-de6c-4efd-9358-f28dd8dcb52c.png", 
  "/lovable-uploads/a13d8147-86d7-4e56-b349-ab8264e6ac07.png",
  "/lovable-uploads/DSCN2434.JPG",
  "/lovable-uploads/DSCN2439.JPG",
  "/lovable-uploads/DSCN2440.JPG",
  "/lovable-uploads/DSCN2442.JPG"
];
const Gallery = () => {
  return <>
      <SEO title="Love Parade 2005 - Dance One Radio Gallery" description="Relive the magic of Love Parade 2005 through our exclusive photo gallery. Experience the energy, creativity, and pure joy of electronic music culture at its peak." />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="relative bg-background">
          <ContainerStagger className="relative z-[9999] -mb-12 place-self-center px-6 pt-24 text-center">
            <ContainerAnimated>
              <h1 className="font-['Orbitron'] text-5xl font-bold text-white md:text-7xl drop-shadow-lg">Love Parade 2005 San Francisco</h1>
            </ContainerAnimated>
          </ContainerStagger>

          {/* Cyber glow effect */}
          <div className="pointer-events-none absolute z-10 h-[70vh] w-full opacity-30" style={{
          background: "var(--gradient-cyber)",
          filter: "blur(100px)",
          mixBlendMode: "screen"
        }} />

          <ContainerScroll className="relative h-[500vh]">
            <ContainerSticky className="h-screen overflow-hidden">
              <GalleryContainer className="p-4 h-full">
                <GalleryCol yRange={["-20%", "10%"]} className="-mt-2">
                  {IMAGES_1.map((imageUrl, index) => <div key={index} className="relative group mb-4">
                      <img className="aspect-video block h-auto max-h-full w-full rounded-lg object-cover shadow-lg card-cyber transition-all duration-300 group-hover:shadow-glow-cyber" src={imageUrl} alt={`Love Parade 2005 moment ${index + 1}`} loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end p-4">
                        <div className="flex items-center gap-2 text-cyber-blue">
                          <Star className="size-4" />
                          <span className="text-sm font-medium">Featured Moment</span>
                        </div>
                      </div>
                    </div>)}
                </GalleryCol>
                <GalleryCol className="mt-[-40%]" yRange={["20%", "-5%"]}>
                  {IMAGES_2.map((imageUrl, index) => <div key={index} className="relative group mb-4">
                      <img className="aspect-video block h-auto max-h-full w-full rounded-lg object-cover shadow-lg card-cyber transition-all duration-300 group-hover:shadow-glow-purple" src={imageUrl} alt={`Love Parade 2005 celebration ${index + 1}`} loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end p-4">
                        <div className="flex items-center gap-2 text-electric-purple">
                          <Radio className="size-4" />
                          <span className="text-sm font-medium">Behind the Scenes</span>
                        </div>
                      </div>
                    </div>)}
                </GalleryCol>
                <GalleryCol yRange={["-50%", "50%"]} className="-mt-2">
                  {IMAGES_3.map((imageUrl, index) => <div key={index} className="relative group mb-4">
                      <img className="aspect-video block h-auto max-h-full w-full rounded-lg object-cover shadow-lg card-cyber transition-all duration-300 group-hover:shadow-glow-neon" src={imageUrl} alt={`Love Parade 2005 festival ${index + 1}`} loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end p-4">
                        <div className="flex items-center gap-2 text-neon-green">
                          <Heart className="size-4" />
                          <span className="text-sm font-medium">Community Love</span>
                        </div>
                      </div>
                    </div>)}
                </GalleryCol>
              </GalleryContainer>
            </ContainerSticky>
          </ContainerScroll>
        </div>
        
        <Footer />
      </div>
    </>;
};
export default Gallery;