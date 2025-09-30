import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Gallery = () => {
  return (
    <>
      <SEO
        title="Photo Galleries - Dance One Radio"
        description="Explore our collection of photo galleries from Love Parade events in San Francisco. Relive the energy and creativity of electronic music culture."
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <h1 className="font-['Orbitron'] text-4xl md:text-6xl font-bold text-foreground mb-4">
              Photo Galleries
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore our collection of Love Parade memories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link to="/gallery/love-parade-2005">
              <Card className="card-cyber hover:shadow-glow-cyber transition-all duration-300 cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="font-['Orbitron'] text-2xl">Love Parade 2005</CardTitle>
                  <CardDescription>San Francisco</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src="/lovable-uploads/456045ea-1b09-4d4a-a5b5-92feb3d9b232.png"
                      alt="Love Parade 2005 San Francisco"
                      className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <p className="text-muted-foreground">
                    View 114 photos from Love Parade 2005
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gallery/love-parade-2006">
              <Card className="card-cyber hover:shadow-glow-cyber transition-all duration-300 cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="font-['Orbitron'] text-2xl">Love Parade 2006</CardTitle>
                  <CardDescription>San Francisco</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src="/lovable-uploads/904ad015-6a99-4f89-9045-773a74fef249.png"
                      alt="Love Parade 2006 San Francisco"
                      className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <p className="text-muted-foreground">
                    View photos from Love Parade 2006
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Gallery;
