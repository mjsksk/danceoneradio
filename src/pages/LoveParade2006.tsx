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
  { url: "/lovable-uploads/LoveparadeSF_2006_152.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_155.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_156.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_160.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_162.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_167.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_169.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_170.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_171.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_172.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_174.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_175.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_177.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_179.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_180.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_181.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_183.JPG" },
  { url: "/lovable-uploads/LoveparadeSF_2006_184.JPG", explicit: true },
  { url: "/lovable-uploads/LoveparadeSF_2006_185.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_1.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_2.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_3.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_4.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_5.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_30.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_32.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_34.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_42.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_46.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_47.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_68.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_69.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_70.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_71.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_72.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_79.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_82.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_88.JPG" },
  { url: "/lovable-uploads/LoveparadeSF06AfterParty_92.JPG" },
];

const LoveParade2006 = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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
            <p className="text-muted-foreground text-lg mb-6">
              {ALL_IMAGES.length} photos from the festival
            </p>
            <div className="flex justify-center">
              <SocialShare 
                url={window.location.href}
                title="Love Parade 2006 San Francisco - Photo Gallery"
                description={`View ${ALL_IMAGES.length} photos from Love Parade 2006 in San Francisco. Experience the energy and creativity of this iconic electronic music festival.`}
                image={`${window.location.origin}/assets/love-parade-2006.png`}
              />
            </div>
          </div>

          <GoogleAds key="loveparade2006-ad" slot="6777392184" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ALL_IMAGES.map((image, index) => (
              <GalleryImage
                key={index}
                src={image.url}
                alt={`Love Parade 2006 - Photo ${index + 1}`}
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
        altPrefix="Love Parade 2006"
      />
    </>
  );
};

export default LoveParade2006;
