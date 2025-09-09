import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, X, Loader2 } from "lucide-react";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { cn } from "@/lib/utils";

const Footer = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const usernameCheck = useUsernameCheck(username, 300);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameCheck.available && username.trim()) {
      // Navigate to auth page with the username pre-filled and signup tab active
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
    if (username.length < 3) return "border-muted-foreground";
    if (usernameCheck.isChecking) return "border-muted-foreground";
    return usernameCheck.available ? "border-green-600" : "border-destructive";
  };

  return (
    <footer className="bg-muted/30 border-t border-border/50 py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold">
              Claim Your Username
            </h3>
            <p className="text-muted-foreground">
              Secure your unique thecurately.com/username before someone else does
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
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
                    "pl-[120px] pr-10 h-12",
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
                className="bg-gradient-primary hover:opacity-90 h-12 px-6"
                disabled={!usernameCheck.available || username.length < 3 || usernameCheck.isChecking}
              >
                Claim It
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            {usernameCheck.message && (
              <p className={cn(
                "text-sm",
                usernameCheck.available ? "text-green-600" : "text-destructive"
              )}>
                {usernameCheck.message}
              </p>
            )}
          </form>

          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/1edf8796-86e3-4b7a-8081-247f973203a3.png" 
                  alt="Curately Logo" 
                  className="w-6 h-6"
                />
                <span className="font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Curately
                </span>
              </Link>
              
              <nav className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#features" className="hover:text-foreground transition-colors">
                  Features
                </a>
                <Link to="/demo" className="hover:text-foreground transition-colors">
                  Example
                </Link>
                <a href="#pro" className="hover:text-foreground transition-colors">
                  Pro
                </a>
              </nav>
            </div>
            
            <div className="text-center mt-6 text-xs text-muted-foreground">
              © 2024 Curately. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;