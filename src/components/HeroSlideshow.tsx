import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Heart, BookOpen, Palette, ShoppingBag } from "lucide-react";

interface SlideItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price?: string;
}

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Heart;
  backgroundColor: string;
  items: SlideItem[];
}

const slidesData: Slide[] = [
  {
    id: "wellness",
    title: "Lifestyle & Wellness",
    subtitle: "Curated wellness essentials for mind and body",
    icon: Heart,
    backgroundColor: "from-emerald-400/20 to-teal-500/20",
    items: [
      {
        id: "meditation-app",
        title: "Meditation App",
        description: "Daily mindfulness practice",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&crop=center",
        price: "Free"
      },
      {
        id: "yoga-mat",
        title: "Premium Yoga Mat",
        description: "Eco-friendly & non-slip",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop&crop=center",
        price: "$89"
      },
      {
        id: "wellness-tea",
        title: "Wellness Tea Set",
        description: "Organic herbal blends",
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop&crop=center",
        price: "$45"
      }
    ]
  },
  {
    id: "creativity",
    title: "Design & Creativity",
    subtitle: "Tools and inspiration for creative minds",
    icon: Palette,
    backgroundColor: "from-purple-400/20 to-pink-500/20",
    items: [
      {
        id: "design-software",
        title: "Design Software",
        description: "Professional creative suite",
        image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=200&h=200&fit=crop&crop=center",
        price: "$20/mo"
      },
      {
        id: "sketchbook",
        title: "Premium Sketchbook",
        description: "High-quality paper for artists",
        image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=200&fit=crop&crop=center",
        price: "$35"
      },
      {
        id: "drawing-tablet",
        title: "Drawing Tablet",
        description: "Digital art made easy",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=center",
        price: "$299"
      }
    ]
  },
  {
    id: "fashion",
    title: "Digital Closet",
    subtitle: "Curated fashion picks from top influencers",
    icon: ShoppingBag,
    backgroundColor: "from-rose-400/20 to-pink-500/20",
    items: [
      {
        id: "silk-blouse",
        title: "Silk Blouse",
        description: "Elegant everyday essential",
        image: "https://images.unsplash.com/photo-1564584217132-2271339e5ebe?w=200&h=200&fit=crop&crop=center",
        price: "$120"
      },
      {
        id: "denim-skirt",
        title: "High-Waist Denim",
        description: "Versatile mini skirt",
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop&crop=center",
        price: "$85"
      },
      {
        id: "accessories",
        title: "Statement Earrings",
        description: "Gold-plated hoops",
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop&crop=center",
        price: "$65"
      }
    ]
  },
  {
    id: "books",
    title: "Books & Learning",
    subtitle: "Essential reads for personal growth",
    icon: BookOpen,
    backgroundColor: "from-blue-400/20 to-indigo-500/20",
    items: [
      {
        id: "business-book",
        title: "Startup Guide",
        description: "From idea to success",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop&crop=center",
        price: "$25"
      },
      {
        id: "design-book",
        title: "Design Thinking",
        description: "Creative problem solving",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop&crop=center",
        price: "$32"
      },
      {
        id: "course-platform",
        title: "Online Course",
        description: "Skill building platform",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop&crop=center",
        price: "$99"
      }
    ]
  }
];

const HeroSlideshow = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    // Auto-play functionality
    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => {
      clearInterval(interval);
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="relative w-full">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {slidesData.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0">
              <div className="relative">
                <Card className={`overflow-hidden border-0 bg-gradient-to-br ${slide.backgroundColor} backdrop-blur-sm shadow-elegant`}>
                  <CardContent className="p-6 space-y-6">
                    {/* Slide Header */}
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <slide.icon className="w-6 h-6" />
                        <h3 className="text-xl font-bold">{slide.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {slide.items.map((item) => (
                        <div
                          key={item.id}
                          className="group cursor-pointer"
                        >
                          <div className="bg-white/80 rounded-lg p-3 space-y-2 hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-sm">
                            <div className="aspect-square overflow-hidden rounded-md">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                                {item.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>
                              {item.price && (
                                <p className="text-xs font-bold text-primary">
                                  {item.price}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white/80 hover:bg-white" />
        <CarouselNext className="right-2 bg-white/80 hover:bg-white" />
      </Carousel>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {slidesData.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === current ? "bg-primary w-6" : "bg-primary/30"
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlideshow;