import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Curately
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <Link to="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Example
            </Link>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button variant="default" size="sm" className="text-sm px-3 py-2" asChild>
              <Link to="/auth">
                <span className="hidden sm:inline">Start Free</span>
                <span className="sm:hidden">Sign Up</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;