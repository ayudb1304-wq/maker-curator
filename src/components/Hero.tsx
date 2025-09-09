import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Users, Sparkles, Zap, Check, X, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { cn } from "@/lib/utils";
import HeroSlideshow from "@/components/HeroSlideshow";

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
      <div className="absolute top-20 left-4 lg:left-10 w-32 h-32 lg:w-72 lg:h-72 bg-primary-glow/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-4 lg:right-10 w-48 h-48 lg:w-96 lg:h-96 bg-primary/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="space-y-3 lg:space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium">
                <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
                Transform your recommendations
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent leading-tight">
                Curately
              </h1>
              
              <h2 className="text-lg sm:text-xl lg:text-4xl font-semibold text-foreground/90">
                Your beautiful recommendation page
              </h2>
              
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Replace boring link-in-bio pages with stunning product recommendations. 
                Share what you love, earn what you deserve, all from your unique curately page.
              </p>
            </div>

            <div className="space-y-3 lg:space-y-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mx-auto lg:mx-0">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs lg:text-sm">
                    thecurately.com/
                  </div>
                  <Input
                    type="text"
                    placeholder="yourname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className={cn(
                      "pl-[110px] lg:pl-[120px] pr-10 h-10 lg:h-12 bg-white border-2 border-primary text-foreground placeholder:text-muted-foreground focus:border-primary ring-2 ring-primary/20",
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
                  className="h-10 lg:h-12 px-4 lg:px-6 group bg-primary text-primary-foreground hover:bg-primary/90"
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
              
              <Button variant="secondary" size="default" className="bg-white/90 text-foreground hover:bg-white border-0 mx-auto lg:mx-0 h-10 lg:h-12" asChild>
                <Link to="/demo">
                  View Example
                </Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 lg:gap-6 justify-center lg:justify-start text-xs lg:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 lg:gap-2">
                <Users className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>Join early creators</span>
              </div>
              <div className="flex items-center gap-1.5 lg:gap-2">
                <Zap className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>100% Free MVP</span>
              </div>
            </div>
          </div>

          {/* Right Slideshow */}
          <div className="relative lg:order-2 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant transform hover:scale-105 transition-transform duration-500">
              <HeroSlideshow />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-card">
              <div className="text-sm font-semibold text-primary">thecurately.com/you</div>
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