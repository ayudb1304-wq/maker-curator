import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Users, Sparkles, Zap, Check, X, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const usernameCheck = useUsernameCheck(username, 300);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameCheck.available && username.trim()) {
      navigate(`/auth?username=${encodeURIComponent(username.trim().toLowerCase())}&tab=signup`);
    }
  };

  const getInputIcon = () => {
    if (usernameCheck.isChecking) {
      return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
    if (username.length >= 3) {
      return usernameCheck.available ? 
        <Check className="w-4 h-4 text-green-600" /> : 
        <X className="w-4 h-4 text-destructive" />;
    }
    return null;
  };

  const getInputStatus = () => {
    if (!username.trim()) return "";
    if (username.length < 3) return "border-border";
    if (usernameCheck.isChecking) return "border-border";
    return usernameCheck.available ? "border-green-600" : "border-destructive";
  };

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
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent leading-tight">
                Curately
              </h1>
              
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-semibold text-foreground/90">
                Your beautiful recommendation page
              </h2>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Replace boring link-in-bio pages with stunning product recommendations. 
                Share what you love, earn what you deserve, all from your unique curately page.
              </p>
            </div>

            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    thecurately.com/
                  </div>
                  <Input
                    type="text"
                    placeholder="yourname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className={cn(
                      "pl-[120px] pr-10 h-12 bg-white border-input text-foreground placeholder:text-muted-foreground",
                      getInputStatus()
                    )}
                    maxLength={20}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getInputIcon()}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  variant="default"
                  className="h-12 px-6 group"
                  disabled={!usernameCheck.available || username.length < 3 || usernameCheck.isChecking}
                >
                  Claim It
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
              
              {usernameCheck.message && (
                <p className={cn(
                  "text-sm text-center lg:text-left",
                  usernameCheck.available ? "text-green-600" : "text-destructive"
                )}>
                  {usernameCheck.message}
                </p>
              )}
              
              <Button variant="outline" size="lg" className="border-white/20 hover:border-white/40 text-white hover:bg-white/10 mx-auto lg:mx-0" asChild>
                <Link to="/demo">
                  View Example
                </Link>
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
            <div className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-white/90 backdrop-blur-sm p-3 lg:p-4 rounded-xl shadow-card">
              <div className="text-xs sm:text-sm font-semibold text-primary">thecurately.com/you</div>
              <div className="text-xs text-muted-foreground">Your unique URL</div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-white/90 backdrop-blur-sm p-3 lg:p-4 rounded-xl shadow-card">
              <div className="text-xs sm:text-sm font-semibold text-foreground">Beautiful & Mobile</div>
              <div className="text-xs text-muted-foreground">Optimized for sharing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;