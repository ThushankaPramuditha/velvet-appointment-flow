import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalonService } from "./useSalonConfig";

export const useUpdateServices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (services: SalonService[]) => {
      // First get the salon config id
      const { data: configData, error: fetchError } = await supabase
        .from("salon_config")
        .select("id")
        .limit(1)
        .single();

      if (fetchError) {
        throw new Error("Failed to fetch salon config");
      }

      const { error } = await supabase
        .from("salon_config")
        .update({ services: JSON.parse(JSON.stringify(services)) })
        .eq("id", configData.id);

      if (error) {
        throw error;
      }

      return services;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-config"] });
    },
  });
};
