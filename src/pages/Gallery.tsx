import { useState } from "react";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// All Love Parade 2005 images
const ALL_IMAGES = [
  "/lovable-uploads/456045ea-1b09-4d4a-a5b5-92feb3d9b232.png",
  "/lovable-uploads/904ad015-6a99-4f89-9045-773a74fef249.png",
  "/lovable-uploads/adebbaa6-a671-4552-92df-75fa9ee22e59.png",
  "/lovable-uploads/e85e609a-ca18-49ba-a3d2-64056b100d75.png",
  "/lovable-uploads/cb44467f-22aa-4065-b0c2-21e90051c6e0.png",
  "/lovable-uploads/27372fc3-4a92-4713-b992-5044632d553c.png",
  "/lovable-uploads/3d724d81-1a61-4f83-b45f-08d6bab09744.png",
  "/lovable-uploads/085cba21-1654-4f82-98d4-fe637a0e7f50.png",
  "/lovable-uploads/5c460280-de6c-4efd-9358-f28dd8dcb52c.png",
  "/lovable-uploads/a13d8147-86d7-4e56-b349-ab8264e6ac07.png",
  "/lovable-uploads/DSCN2432.JPG",
  "/lovable-uploads/DSCN2434.JPG",
  "/lovable-uploads/DSCN2435.JPG",
  "/lovable-uploads/DSCN2436.JPG",
  "/lovable-uploads/DSCN2437.JPG",
  "/lovable-uploads/DSCN2438.JPG",
  "/lovable-uploads/DSCN2439.JPG",
  "/lovable-uploads/DSCN2440.JPG",
  "/lovable-uploads/DSCN2441.JPG",
  "/lovable-uploads/DSCN2442.JPG",
  "/lovable-uploads/DSCN2420-2.JPG",
  "/lovable-uploads/DSCN2421-2.JPG",
  "/lovable-uploads/DSCN2422-2.JPG",
  "/lovable-uploads/DSCN2423-2.JPG",
  "/lovable-uploads/DSCN2424-2.JPG",
  "/lovable-uploads/DSCN2425-2.JPG",
  "/lovable-uploads/DSCN2426-2.JPG",
  "/lovable-uploads/DSCN2427-2.JPG",
  "/lovable-uploads/DSCN2429-2.JPG",
  "/lovable-uploads/DSCN2431-2.JPG",
  "/lovable-uploads/DSCN2443.JPG",
  "/lovable-uploads/DSCN2444.JPG",
  "/lovable-uploads/DSCN2445.JPG",
  "/lovable-uploads/DSCN2446.JPG",
  "/lovable-uploads/DSCN2447.JPG",
  "/lovable-uploads/DSCN2448.JPG",
  "/lovable-uploads/DSCN2450.JPG",
  "/lovable-uploads/DSCN2451.JPG",
  "/lovable-uploads/DSCN2453.JPG",
  "/lovable-uploads/DSCN2454.JPG",
  "/lovable-uploads/DSCN2456.JPG",
  "/lovable-uploads/DSCN2457.JPG",
  "/lovable-uploads/DSCN2458.JPG",
  "/lovable-uploads/DSCN2460.JPG",
  "/lovable-uploads/DSCN2461.JPG",
  "/lovable-uploads/DSCN2462.JPG",
  "/lovable-uploads/DSCN2463.JPG",
  "/lovable-uploads/DSCN2464.JPG",
  "/lovable-uploads/DSCN2465.JPG",
  "/lovable-uploads/DSCN2466.JPG",
  "/lovable-uploads/DSCN2469.JPG",
  "/lovable-uploads/DSCN2470.JPG",
  "/lovable-uploads/DSCN2471.JPG",
  "/lovable-uploads/DSCN2472.JPG",
  "/lovable-uploads/DSCN2473.JPG",
  "/lovable-uploads/DSCN2474.JPG",
  "/lovable-uploads/DSCN2475.JPG",
  "/lovable-uploads/DSCN2476.JPG",
  "/lovable-uploads/DSCN2477.JPG",
  "/lovable-uploads/DSCN2478.JPG",
  "/lovable-uploads/DSCN2479.JPG",
  "/lovable-uploads/DSCN2480.JPG",
  "/lovable-uploads/DSCN2481.JPG",
  "/lovable-uploads/DSCN2482.JPG",
  "/lovable-uploads/DSCN2483.JPG",
  "/lovable-uploads/DSCN2484.JPG",
  "/lovable-uploads/DSCN2485.JPG",
  "/lovable-uploads/DSCN2487.JPG",
  "/lovable-uploads/DSCN2490.JPG",
  "/lovable-uploads/DSCN2491.JPG",
  "/lovable-uploads/DSCN2492.JPG",
  "/lovable-uploads/DSCN2493.JPG",
  "/lovable-uploads/DSCN2496.JPG",
  "/lovable-uploads/DSCN2498.JPG",
  "/lovable-uploads/DSCN2499.JPG",
  "/lovable-uploads/DSCN2502.JPG",
  "/lovable-uploads/DSCN2505.JPG",
  "/lovable-uploads/DSCN2506.JPG",
  "/lovable-uploads/DSCN2507.JPG",
  "/lovable-uploads/DSCN2508.JPG",
  "/lovable-uploads/DSCN2509.JPG",
  "/lovable-uploads/DSCN2510.JPG",
  "/lovable-uploads/DSCN2511.JPG",
  "/lovable-uploads/DSCN2513.JPG",
  "/lovable-uploads/DSCN2514.JPG",
  "/lovable-uploads/DSCN2515.JPG",
  "/lovable-uploads/DSCN2517.JPG",
  "/lovable-uploads/DSCN2518.JPG",
  "/lovable-uploads/DSCN2519.JPG",
  "/lovable-uploads/DSCN2520.JPG",
  "/lovable-uploads/DSCN2521.JPG",
  "/lovable-uploads/DSCN2524.JPG",
  "/lovable-uploads/DSCN2525.JPG",
  "/lovable-uploads/DSCN2526.JPG",
  "/lovable-uploads/DSCN2527.JPG",
  "/lovable-uploads/DSCN2528.JPG",
  "/lovable-uploads/DSCN2533.JPG",
  "/lovable-uploads/DSCN2534.JPG",
  "/lovable-uploads/DSCN2535.JPG",
  "/lovable-uploads/DSCN2536.JPG",
  "/lovable-uploads/DSCN2538.JPG",
  "/lovable-uploads/DSCN2539.JPG",
  "/lovable-uploads/DSCN2541.JPG",
  "/lovable-uploads/DSCN2542.JPG",
  "/lovable-uploads/DSCN2543.JPG",
  "/lovable-uploads/DSCN2544.JPG",
  "/lovable-uploads/DSCN2545.JPG",
  "/lovable-uploads/DSCN2547.JPG",
  "/lovable-uploads/DSCN2549.JPG",
  "/lovable-uploads/DSCN2552.JPG",
];

const Gallery = () => {
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
        title="Love Parade 2005 - Dance One Radio Gallery"
        description="Relive the magic of Love Parade 2005 through our exclusive photo gallery. Experience the energy, creativity, and pure joy of electronic music culture at its peak."
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <h1 className="font-['Orbitron'] text-4xl md:text-6xl font-bold text-foreground mb-4">
              Love Parade 2005 San Francisco
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
                  src={image}
                  alt={`Love Parade 2005 - Photo ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-foreground font-semibold text-lg">View Photo</span>
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
                  src={ALL_IMAGES[selectedImageIndex]}
                  alt={`Love Parade 2005 - Photo ${selectedImageIndex + 1}`}
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

export default Gallery;
