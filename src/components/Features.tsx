import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, Palette, Smartphone, TrendingUp, Zap, Heart } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Link,
      title: "Your Unique URL",
      description: "Get thecurately.com/yourname - a clean, professional link for all your social profiles.",
      highlight: "Professional branding"
    },
    {
      icon: Palette,
      title: "Beautiful Design",
      description: "Stunning, mobile-first pages that make your recommendations shine and convert better.",
      highlight: "Mobile optimized"
    },
    {
      icon: Smartphone,
      title: "One-Click Sharing",
      description: "Replace cluttered link-in-bio pages with focused product recommendations your audience will love.",
      highlight: "Higher engagement"
    },
    {
      icon: TrendingUp,
      title: "Affiliate Ready",
      description: "Perfect for affiliate marketers. Add your links and track what your audience loves most.",
      highlight: "Revenue focused"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Pages load instantly, keeping your audience engaged and driving more clicks to your recommendations.",
      highlight: "Speed matters"
    },
    {
      icon: Heart,
      title: "Creator First",
      description: "Built by creators, for creators. Simple tools that help you share what you genuinely love.",
      highlight: "Authentic recommendations"
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Everything you need to curate
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Simple, powerful tools to create beautiful recommendation pages that your audience will actually want to visit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 group">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {feature.highlight}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg" className="group">
            Start Building Your Page
            <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;