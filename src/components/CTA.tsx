import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-10 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Join the creator revolution
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight">
            Ready to start curating?
          </h2>
          
           <p className="text-lg sm:text-xl text-white/90 leading-relaxed px-4">
             Transform your knowledge into a beautiful, shareable recommendation page that your audience will love.
           </p>

           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button 
               variant="secondary" 
               size="lg" 
               className="bg-white text-primary hover:bg-white/90 shadow-glow group"
               asChild
             >
               <Link to="/auth">
                 Start Building Your Page
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </Link>
             </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
              asChild
            >
              <Link to="/demo">
                See Example Page
              </Link>
            </Button>
          </div>

          <div className="text-white/70 text-sm">
            ✨ 100% free during MVP • No credit card required • Get started in 2 minutes
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;