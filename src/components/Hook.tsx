import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Hook = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Heart className="w-4 h-4" />
              From knowledge to connection
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Stop letting your best recommendations 
              <span className="bg-gradient-primary bg-clip-text text-transparent"> disappear into the void</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Every day, you share amazing recommendations with friends, family, and colleagues. 
              But these golden nuggets get lost in chat threads and forgotten conversations.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 py-8">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Build Your Reputation</h3>
              <p className="text-sm text-muted-foreground">
                Become the go-to person for recommendations in your niche
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Share Effortlessly</h3>
              <p className="text-sm text-muted-foreground">
                One link to share all your curated recommendations
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Help Others Discover</h3>
              <p className="text-sm text-muted-foreground">
                Turn your taste into a valuable resource for your community
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-foreground font-medium">
              Ready to turn your recommendations into your personal brand?
            </p>
            
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 shadow-glow group"
              asChild
            >
              <Link to="/auth">
                Create Your Page Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-2" />
              </Link>
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Join creators who are already building their reputation through curated recommendations
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hook;