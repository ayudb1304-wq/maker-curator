import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Sparkles, Zap } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-glow/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Transform your recommendations
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent leading-tight">
                Curator
              </h1>
              
              <h2 className="text-2xl lg:text-4xl font-semibold text-foreground/90">
                Your beautiful recommendation page
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Replace boring link-in-bio pages with stunning product recommendations. 
                Share what you love, earn what you deserve, all from your unique curator page.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="group">
                Start Curating Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="border-primary/20 hover:border-primary/40">
                View Example
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Join early creators</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>100% Free MVP</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:order-2">
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Beautiful curated product workspace showcasing various recommended items"
                className="w-full h-auto rounded-2xl shadow-elegant transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-card">
              <div className="text-sm font-semibold text-primary">curator.app/you</div>
              <div className="text-xs text-muted-foreground">Your unique URL</div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-card">
              <div className="text-sm font-semibold text-foreground">Beautiful & Mobile</div>
              <div className="text-xs text-muted-foreground">Optimized for sharing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;