import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border/50 py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="text-center text-muted-foreground">
            Join thousands of creators building beautiful recommendation pages
          </div>

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