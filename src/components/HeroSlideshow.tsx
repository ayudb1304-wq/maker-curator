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
    title: "My Wellness Essentials",
    subtitle: "These have honestly changed my daily routine for the better ✨",
    icon: Heart,
    backgroundColor: "from-emerald-400/20 to-teal-500/20",
    items: [
      {
        id: "meditation-app",
        title: "Headspace",
        description: "I use this every morning - such a game changer for my anxiety!",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&crop=center"
      },
      {
        id: "yoga-mat",
        title: "Manduka Yoga Mat",
        description: "Best investment for my home workouts. So grippy and comfy!",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop&crop=center"
      },
      {
        id: "wellness-tea",
        title: "Traditional Medicinals Tea",
        description: "My nightly ritual - the chamomile one is pure magic",
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop&crop=center"
      }
    ]
  },
  {
    id: "creativity",
    title: "Creative Tools I Swear By",
    subtitle: "Everything I use to bring my ideas to life 🎨",
    icon: Palette,
    backgroundColor: "from-purple-400/20 to-pink-500/20",
    items: [
      {
        id: "design-software",
        title: "Figma",
        description: "Where all my design magic happens - can't live without it!",
        image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=200&h=200&fit=crop&crop=center"
      },
      {
        id: "sketchbook",
        title: "Moleskine Sketchbook",
        description: "Perfect for brainstorming and those random 3am ideas",
        image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=200&fit=crop&crop=center"
      },
      {
        id: "drawing-tablet",
        title: "Wacom Intuos",
        description: "Made digital art so much easier - total game changer!",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=center"
      }
    ]
  },
  {
    id: "fashion",
    title: "Current Closet Favorites",
    subtitle: "These pieces have been on repeat lately 💕",
    icon: ShoppingBag,
    backgroundColor: "from-rose-400/20 to-pink-500/20",
    items: [
      {
        id: "silk-blouse",
        title: "Everlane Silk Shirt",
        description: "Goes with literally everything - so worth the splurge!",
        image: "https://images.unsplash.com/photo-1564584217132-2271339e5ebe?w=200&h=200&fit=crop&crop=center"
      },
      {
        id: "denim-skirt",
        title: "Vintage Levi's Skirt",
        description: "Found this gem thrifting - obsessed with the fit!",
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop&crop=center"
      },
      {
        id: "accessories",
        title: "Mejuri Hoops",
        description: "These elevate every outfit - wearing them right now!",
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop&crop=center"
      }
    ]
  },
  {
    id: "books",
    title: "Books That Blew My Mind",
    subtitle: "Currently stacked on my nightstand 📚",
    icon: BookOpen,
    backgroundColor: "from-blue-400/20 to-indigo-500/20",
    items: [
      {
        id: "business-book",
        title: "The Lean Startup",
        description: "Wish I'd read this before starting my business - so insightful!",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop&crop=center"
      },
      {
        id: "design-book",
        title: "Don't Make Me Think",
        description: "Changed how I approach design completely - mind blown!",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop&crop=center"
      },
      {
        id: "course-platform",
        title: "MasterClass",
        description: "Been binge-watching the photography classes - so inspiring!",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop&crop=center"
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