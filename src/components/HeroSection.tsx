import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSalonConfig } from "@/hooks/useSalonConfig";
import { Calendar, Clock, MapPin } from "lucide-react";

const HeroSection = () => {
  const { data: config, isLoading } = useSalonConfig();

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Now Accepting Appointments</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-foreground">{config?.name || "Welcome to"}</span>
            <br />
            <span className="gold-gradient-text">{config?.tagline || "Premium Grooming"}</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the art of precision grooming in a luxurious setting. 
            Book your appointment today and elevate your style.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/book">
              <Button variant="gold" size="xl" className="min-w-[200px]">
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
            </Link>
            <Link to="/tv">
              <Button variant="outline" size="xl" className="min-w-[200px]">
                View Queue
              </Button>
            </Link>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12">
            <div className="card-luxury p-6 text-center animate-slide-in" style={{ animationDelay: "0.1s" }}>
              <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold mb-1">Opening Hours</h3>
              <p className="text-muted-foreground text-sm">Mon-Fri: 9AM - 6PM</p>
            </div>
            <div className="card-luxury p-6 text-center animate-slide-in" style={{ animationDelay: "0.2s" }}>
              <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold mb-1">Location</h3>
              <p className="text-muted-foreground text-sm">{config?.address || "Downtown"}</p>
            </div>
            <div className="card-luxury p-6 text-center animate-slide-in" style={{ animationDelay: "0.3s" }}>
              <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold mb-1">Contact</h3>
              <p className="text-muted-foreground text-sm">{config?.phone || "Call us"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
