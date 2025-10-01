import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Users, Sparkles, Zap, Check, X, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import HeroSlideshow from "@/components/HeroSlideshow";

const Hero = () => {
  const [username, setUsername] = useState("");
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const usernameCheck = useUsernameCheck(username, 300);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameCheck.available && username.trim()) {
      setShowAuthOptions(true);
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
    <section className="relative min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-4 lg:py-0">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      <div className="absolute top-20 left-4 lg:left-10 w-32 h-32 lg:w-72 lg:h-72 bg-primary-glow/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-4 lg:right-10 w-48 h-48 lg:w-96 lg:h-96 bg-primary/20 rounded-full blur-3xl"></div>
      
      <div className="w-full px-4 lg:px-6 relative z-10 max-w-7xl mx-auto">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 lg:items-center lg:min-h-screen">
          
          {/* Main Content Section */}
          <div className="flex flex-col justify-center pt-16 lg:pt-0 space-y-6 lg:space-y-8 text-center lg:text-left">
            
            {/* Header Section */}
            <div className="space-y-4 lg:space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium">
                <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
                Transform your recommendations
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent leading-tight">
                Curately
              </h1>
              
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-semibold text-foreground/90">
                Your beautiful recommendation page
              </h2>
              
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Replace boring link-in-bio pages with stunning product recommendations. 
                Share what you love, earn what you deserve, all from your unique curately page.
              </p>
            </div>

            {/* Username Claiming Section */}
            <div className="space-y-4 lg:space-y-6">
              <div className="max-w-md mx-auto lg:mx-0">
                {!showAuthOptions ? (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        thecurately.com/
                      </div>
                      <Input
                        type="text"
                        inputMode="text"
                        autoComplete="username"
                        placeholder="yourname"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        className={cn(
                          "pl-[130px] pr-12 h-14 bg-white border-2 border-primary text-foreground placeholder:text-muted-foreground focus:border-primary ring-2 ring-primary/20 text-base min-h-[56px]",
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
                      size="mobile" 
                      variant="default"
                      className="h-14 px-8 group bg-primary text-primary-foreground hover:bg-primary/90 min-h-[56px]"
                      disabled={!usernameCheck.available || username.length < 3 || usernameCheck.isChecking}
                    >
                      Claim My Page
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4 bg-muted/50 p-6 rounded-lg border animate-fade-in">
                    <h3 className="text-center font-semibold text-lg">Create your account to claim:</h3>
                    <p className="text-center text-primary font-bold text-lg -mt-2">thecurately.com/{username}</p>
                    <Button
                      variant="outline"
                      className="w-full h-14 text-base bg-white"
                      onClick={() => {
                        localStorage.setItem('usernameToClaim', username);
                        signInWithGoogle();
                      }}
                    >
                      <svg className="mr-2 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                      </svg>
                      Continue with Google
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full h-14 text-base"
                      onClick={() => navigate(`/auth?username=${encodeURIComponent(username.trim().toLowerCase())}&tab=signup`)}
                    >
                      Continue with Email
                    </Button>
                    <button 
                      onClick={() => setShowAuthOptions(false)} 
                      className="text-sm text-muted-foreground hover:text-foreground w-full mt-2"
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>
              
              {!showAuthOptions && usernameCheck.message && (
                <p className={cn(
                  "text-sm text-center lg:text-left",
                  usernameCheck.available ? "text-green-600" : "text-destructive"
                )}>
                  {usernameCheck.message}
                </p>
              )}
              
              {!showAuthOptions && (
                <Button variant="secondary" size="mobile" className="bg-white/90 text-foreground hover:bg-white border-0 mx-auto lg:mx-0 min-h-[56px]" asChild>
                  <Link to="/demo">
                    View Example
                  </Link>
                </Button>
              )}
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

            {/* Mobile Slideshow Section - Shows after username claiming on mobile */}
            <div className="block lg:hidden mt-8">
              <div className="relative rounded-2xl overflow-hidden shadow-elegant max-w-lg mx-auto">
                <HeroSlideshow />
              </div>
            </div>
          </div>

          {/* Desktop Slideshow Section - Side by side on desktop */}
          <div className="hidden lg:flex lg:items-center lg:justify-center relative">
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