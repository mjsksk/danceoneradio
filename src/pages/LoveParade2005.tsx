import { useState } from "react";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import GoogleAds from "@/components/GoogleAds";
import { AD_SLOTS } from "@/config/adSlots";
import SocialShare from "@/components/SocialShare";
import GalleryImage from "@/components/gallery/GalleryImage";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import { Link } from "react-router-dom";

// Image metadata with explicit content marking
interface ImageData {
  url: string;
  explicit?: boolean;
}

// All Love Parade 2005 images
const ALL_IMAGES: ImageData[] = [
  { url: "/lovable-uploads/456045ea-1b09-4d4a-a5b5-92feb3d9b232.png" },
  { url: "/lovable-uploads/904ad015-6a99-4f89-9045-773a74fef249.png" },
  { url: "/lovable-uploads/adebbaa6-a671-4552-92df-75fa9ee22e59.png" },
  { url: "/lovable-uploads/e85e609a-ca18-49ba-a3d2-64056b100d75.png" },
  { url: "/lovable-uploads/cb44467f-22aa-4065-b0c2-21e90051c6e0.png" },
  { url: "/lovable-uploads/27372fc3-4a92-4713-b992-5044632d553c.png" },
  { url: "/lovable-uploads/3d724d81-1a61-4f83-b45f-08d6bab09744.png" },
  { url: "/lovable-uploads/085cba21-1654-4f82-98d4-fe637a0e7f50.png" },
  { url: "/lovable-uploads/5c460280-de6c-4efd-9358-f28dd8dcb52c.png" },
  { url: "/lovable-uploads/a13d8147-86d7-4e56-b349-ab8264e6ac07.png" },
  { url: "/lovable-uploads/DSCN2432.JPG" },
  { url: "/lovable-uploads/DSCN2434.JPG" },
  { url: "/lovable-uploads/DSCN2435.JPG" },
  { url: "/lovable-uploads/DSCN2436.JPG" },
  { url: "/lovable-uploads/DSCN2437.JPG" },
  { url: "/lovable-uploads/DSCN2438.JPG" },
  { url: "/lovable-uploads/DSCN2439.JPG" },
  { url: "/lovable-uploads/DSCN2440.JPG" },
  { url: "/lovable-uploads/DSCN2441.JPG" },
  { url: "/lovable-uploads/DSCN2442.JPG" },
  { url: "/lovable-uploads/DSCN2420-2.JPG" },
  { url: "/lovable-uploads/DSCN2421-2.JPG" },
  { url: "/lovable-uploads/DSCN2422-2.JPG" },
  { url: "/lovable-uploads/DSCN2423-2.JPG" },
  { url: "/lovable-uploads/DSCN2424-2.JPG" },
  { url: "/lovable-uploads/DSCN2425-2.JPG" },
  { url: "/lovable-uploads/DSCN2426-2.JPG" },
  { url: "/lovable-uploads/DSCN2427-2.JPG" },
  { url: "/lovable-uploads/DSCN2429-2.JPG" },
  { url: "/lovable-uploads/DSCN2431-2.JPG" },
  { url: "/lovable-uploads/DSCN2443.JPG" },
  { url: "/lovable-uploads/DSCN2444.JPG" },
  { url: "/lovable-uploads/DSCN2445.JPG" },
  { url: "/lovable-uploads/DSCN2446.JPG" },
  { url: "/lovable-uploads/DSCN2447.JPG" },
  { url: "/lovable-uploads/DSCN2448.JPG" },
  { url: "/lovable-uploads/DSCN2450.JPG" },
  { url: "/lovable-uploads/DSCN2451.JPG" },
  { url: "/lovable-uploads/DSCN2453.JPG" },
  { url: "/lovable-uploads/DSCN2454.JPG" },
  { url: "/lovable-uploads/DSCN2456.JPG" },
  { url: "/lovable-uploads/DSCN2457.JPG" },
  { url: "/lovable-uploads/DSCN2458.JPG" },
  { url: "/lovable-uploads/DSCN2460.JPG" },
  { url: "/lovable-uploads/DSCN2461.JPG" },
  { url: "/lovable-uploads/DSCN2462.JPG" },
  { url: "/lovable-uploads/DSCN2463.JPG" },
  { url: "/lovable-uploads/DSCN2464.JPG" },
  { url: "/lovable-uploads/DSCN2465.JPG" },
  { url: "/lovable-uploads/DSCN2466.JPG" },
  { url: "/lovable-uploads/DSCN2469.JPG" },
  { url: "/lovable-uploads/DSCN2470.JPG" },
  { url: "/lovable-uploads/DSCN2471.JPG" },
  { url: "/lovable-uploads/DSCN2472.JPG" },
  { url: "/lovable-uploads/DSCN2473.JPG" },
  { url: "/lovable-uploads/DSCN2474.JPG" },
  { url: "/lovable-uploads/DSCN2475.JPG" },
  { url: "/lovable-uploads/DSCN2476.JPG" },
  { url: "/lovable-uploads/DSCN2477.JPG" },
  { url: "/lovable-uploads/DSCN2478.JPG" },
  { url: "/lovable-uploads/DSCN2479.JPG" },
  { url: "/lovable-uploads/DSCN2480.JPG" },
  { url: "/lovable-uploads/DSCN2481.JPG" },
  { url: "/lovable-uploads/DSCN2482.JPG" },
  { url: "/lovable-uploads/DSCN2483.JPG" },
  { url: "/lovable-uploads/DSCN2484.JPG" },
  { url: "/lovable-uploads/DSCN2485.JPG" },
  { url: "/lovable-uploads/DSCN2487.JPG" },
  { url: "/lovable-uploads/DSCN2490.JPG" },
  { url: "/lovable-uploads/DSCN2491.JPG" },
  { url: "/lovable-uploads/DSCN2492.JPG" },
  { url: "/lovable-uploads/DSCN2493.JPG" },
  { url: "/lovable-uploads/DSCN2496.JPG" },
  { url: "/lovable-uploads/DSCN2498.JPG" },
  { url: "/lovable-uploads/DSCN2499.JPG" },
  { url: "/lovable-uploads/DSCN2502.JPG" },
  { url: "/lovable-uploads/DSCN2505.JPG" },
  { url: "/lovable-uploads/DSCN2506.JPG" },
  { url: "/lovable-uploads/DSCN2507.JPG" },
  { url: "/lovable-uploads/DSCN2508.JPG" },
  { url: "/lovable-uploads/DSCN2509.JPG" },
  { url: "/lovable-uploads/DSCN2510.JPG" },
  { url: "/lovable-uploads/DSCN2511.JPG" },
  { url: "/lovable-uploads/DSCN2513.JPG" },
  { url: "/lovable-uploads/DSCN2514.JPG" },
  { url: "/lovable-uploads/DSCN2515.JPG" },
  { url: "/lovable-uploads/DSCN2517.JPG" },
  { url: "/lovable-uploads/DSCN2518.JPG" },
  { url: "/lovable-uploads/DSCN2519.JPG" },
  { url: "/lovable-uploads/DSCN2520.JPG" },
  { url: "/lovable-uploads/DSCN2521.JPG" },
  { url: "/lovable-uploads/DSCN2524.JPG" },
  { url: "/lovable-uploads/DSCN2525.JPG" },
  { url: "/lovable-uploads/DSCN2526.JPG" },
  { url: "/lovable-uploads/DSCN2527.JPG" },
  { url: "/lovable-uploads/DSCN2528.JPG" },
  { url: "/lovable-uploads/DSCN2533.JPG" },
  { url: "/lovable-uploads/DSCN2534.JPG" },
  { url: "/lovable-uploads/DSCN2535.JPG" },
  { url: "/lovable-uploads/DSCN2536.JPG" },
  { url: "/lovable-uploads/DSCN2538.JPG" },
  { url: "/lovable-uploads/DSCN2539.JPG" },
  { url: "/lovable-uploads/DSCN2541.JPG" },
  { url: "/lovable-uploads/DSCN2542.JPG" },
  { url: "/lovable-uploads/DSCN2543.JPG" },
  { url: "/lovable-uploads/DSCN2544.JPG" },
  { url: "/lovable-uploads/DSCN2545.JPG" },
  { url: "/lovable-uploads/DSCN2547.JPG", explicit: true },
  { url: "/lovable-uploads/DSCN2549.JPG", explicit: true },
  { url: "/lovable-uploads/DSCN2552.JPG" },
  { url: "/lovable-uploads/DSCN2553.JPG" },
  { url: "/lovable-uploads/DSCN2555.JPG" },
  { url: "/lovable-uploads/DSCN2558.JPG" },
];

const LoveParade2005 = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  return (
    <>
      <SEO
        title="Love Parade 2005 - Dance One Radio Gallery"
        description="Relive the magic of Love Parade 2005 through our exclusive photo gallery. Experience the energy, creativity, and pure joy of electronic music culture at its peak."
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
              Love Parade 2005 San Francisco
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              {ALL_IMAGES.length} photos from the festival
            </p>
            <div className="flex justify-center">
              <SocialShare 
                url={window.location.href}
                title="Love Parade 2005 San Francisco - Photo Gallery"
                description={`View ${ALL_IMAGES.length} photos from Love Parade 2005 in San Francisco. Experience the energy and creativity of this iconic electronic music festival.`}
                image={`${window.location.origin}/assets/love-parade-2005.jpg`}
              />
            </div>
          </div>

          <GoogleAds key="loveparade2005-ad" slot="6777392184" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ALL_IMAGES.map((image, index) => (
              <GalleryImage
                key={index}
                src={image.url}
                alt={`Love Parade 2005 - Photo ${index + 1}`}
                explicit={image.explicit}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        </div>

        <Footer />
      </div>

      <GalleryLightbox
        images={ALL_IMAGES}
        selectedIndex={selectedImageIndex}
        onClose={() => setSelectedImageIndex(null)}
        onNavigate={setSelectedImageIndex}
        altPrefix="Love Parade 2005"
      />
    </>
  );
};

export default LoveParade2005;
