import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SalonService {
  name: string;
  duration: number;
  price: number;
}

export interface SalonConfig {
  id: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  hero_image_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  opening_hours: Record<string, string>;
  services: SalonService[];
}

export const useSalonConfig = () => {
  return useQuery({
    queryKey: ["salon-config"],
    queryFn: async (): Promise<SalonConfig | null> => {
      const { data, error } = await supabase
        .from("salon_config")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching salon config:", error);
        return null;
      }

      return {
        ...data,
        opening_hours: (data.opening_hours || {}) as Record<string, string>,
        services: (Array.isArray(data.services) ? data.services : []) as unknown as SalonService[],
      };
    },
  });
};
