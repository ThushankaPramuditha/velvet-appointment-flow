import { useSalonConfig } from "@/hooks/useSalonConfig";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign } from "lucide-react";

const ServicesSection = () => {
  const { data: config } = useSalonConfig();
  const services = config?.services || [];

  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our <span className="gold-gradient-text">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our range of premium grooming services, each delivered with precision and care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <div
              key={service.name}
              className="card-luxury p-8 group hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-display text-2xl font-semibold group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <span className="text-2xl font-bold text-primary">${service.price}</span>
              </div>
              
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{service.duration} min</span>
                </div>
              </div>

              <Link to={`/book?service=${encodeURIComponent(service.name)}`}>
                <Button variant="outline" className="w-full group-hover:variant-gold">
                  Book This Service
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
