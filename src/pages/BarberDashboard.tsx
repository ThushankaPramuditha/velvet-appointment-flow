import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import { Loader2 } from "lucide-react";

const BarberDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isStaff, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/auth");
      } else if (!isStaff) {
        // Customer trying to access dashboard - redirect to home
        navigate("/");
      }
    }
  }, [isLoading, isAuthenticated, isStaff, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isStaff) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Dashboard />
    </div>
  );
};

export default BarberDashboard;
