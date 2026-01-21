import { Link, useLocation } from "react-router-dom";
import { useSalonConfig } from "@/hooks/useSalonConfig";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Calendar, Tv, Settings, Scissors, LogIn, LogOut } from "lucide-react";

const Header = () => {
  const { data: config } = useSalonConfig();
  const { isAuthenticated, isStaff, signOut } = useAuth();
  const location = useLocation();

  // Build nav items based on auth state
  const navItems = [
    { path: "/", label: "Home", icon: Scissors, show: true },
    { path: "/book", label: "Book Now", icon: Calendar, show: true },
    { path: "/tv", label: "TV Display", icon: Tv, show: isStaff },
    { path: "/dashboard", label: "Dashboard", icon: Settings, show: isStaff },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {config?.logo_url ? (
              <img
                src={config.logo_url}
                alt={config.name}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Scissors className="h-5 w-5 text-primary" />
              </div>
            )}
            <span className="font-display text-xl font-semibold gold-gradient-text">
              {config?.name || "Luxury Salon"}
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            
            {/* Auth button */}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link to="/book">
              <Button variant="gold" size="sm">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
