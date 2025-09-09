import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Zap } from "lucide-react";

const Pro = () => {
  const proFeatures = [
    "Custom Domain",
    "Remove Curately Branding", 
    "Advanced Theming",
    "Link Analysis",
    "Video Embeds",
    "Priority Support",
    "Everything in Free Version"
  ];

  return (
    <section id="pro" className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-accent" />
            <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Curately Pro
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of your recommendation page with premium features
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-2 border-accent/20 bg-gradient-card shadow-elegant hover:shadow-glow transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary"></div>
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-accent" />
                <CardTitle className="text-2xl">Pro Plan</CardTitle>
              </div>
              <CardDescription className="text-lg">
                Coming Soon
              </CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold text-primary">$9</div>
                <div className="text-muted-foreground">/month</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-6">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  disabled
                >
                  Coming Soon
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Be the first to know when Pro launches
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </section>
  );
};

export default Pro;