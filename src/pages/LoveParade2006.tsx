import { useState } from "react";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";

// Image metadata with explicit content marking
interface ImageData {
  url: string;
  explicit?: boolean;
}

// Love Parade 2006 images
const ALL_IMAGES: ImageData[] = [
  { url: "/lovable-uploads/Loveparade_2006_1.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_3.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_4.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_6.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_7.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_10.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_11.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_16.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_19.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_20.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_22.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_25.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_26.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_27.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_28.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_30.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_31.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_32.JPG" },
  { url: "/lovable-uploads/Loveparade_2006_33.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_1.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_2.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_3.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_4.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_5.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_6.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_8.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_10.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_16.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_17.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_18.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_20.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_21.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_25.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_27.JPG" },
  
  { url: "/lovable-uploads/LoveparadeSF_2006_34.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_36.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_37.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_40.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_43.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_46.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_48.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_49.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_50.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_54.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_56.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_58.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_63.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_67.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_74.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_75.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_90.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_91.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_94.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_98.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_100.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_102.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_103.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_104.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_105.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_107.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_108.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_109.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_110.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_111.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_112.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_113.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_114.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_115.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_118.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_120.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_121.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_123.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_126.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_127.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_128.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_129.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_130.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_131.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_132.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_133.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_134.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_135.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_136.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_144.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_145.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_147.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_148.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_149.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_151.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_152.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_155.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_156.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_160.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_161.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_162.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_167.JPG" },
];

const LoveParade2006 = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const handlePrevious = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + ALL_IMAGES.length) % ALL_IMAGES.length);
    }
  };

  const handleNext = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % ALL_IMAGES.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setSelectedImageIndex(null);
  };

  return (
    <>
      <SEO
        title="Love Parade 2006 - Dance One Radio Gallery"
        description="Relive the magic of Love Parade 2006 through our exclusive photo gallery. Experience the energy, creativity, and pure joy of electronic music culture."
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-24">
          <div className="mb-6">
            <Link to="/gallery" className="text-primary hover:underline">
              ← Back to Galleries
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="font-['Orbitron'] text-4xl md:text-6xl font-bold text-foreground mb-4">
              Love Parade 2006 San Francisco
            </h1>
            <p className="text-muted-foreground text-lg">
              {ALL_IMAGES.length} photos from the festival
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ALL_IMAGES.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg card-cyber hover:shadow-glow-cyber transition-all duration-300"
                onClick={() => setSelectedImageIndex(index)}
              >
                <img
                  src={image.url}
                  alt={`Love Parade 2006 - Photo ${index + 1}`}
                  className={`w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110 ${
                    image.explicit ? 'blur-xl' : ''
                  }`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-foreground font-semibold text-lg">
                    {image.explicit ? 'View Photo (18+)' : 'View Photo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-sm border-0"
          onKeyDown={handleKeyDown}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedImageIndex !== null && (
              <>
                <img
                  src={ALL_IMAGES[selectedImageIndex].url}
                  alt={`Love Parade 2006 - Photo ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-[90vh] object-contain"
                />

                {/* Navigation Buttons */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Close Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 bg-background/80 hover:bg-background"
                  onClick={() => setSelectedImageIndex(null)}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-4 py-2 rounded-full text-sm">
                  {selectedImageIndex + 1} / {ALL_IMAGES.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoveParade2006;
