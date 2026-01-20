import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  queue_position: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useAppointments = (date?: string) => {
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("appointments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["appointments", date],
    queryFn: async (): Promise<Appointment[]> => {
      let query = supabase
        .from("appointments")
        .select("*")
        .order("appointment_time", { ascending: true });

      if (date) {
        query = query.eq("appointment_date", date);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching appointments:", error);
        return [];
      }

      return data as Appointment[];
    },
  });
};

// Separate interface for public queue display (no PII)
export interface QueueAppointment {
  id: string;
  customer_name: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  queue_position: number | null;
}

export const useQueueAppointments = () => {
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("queue-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["queue-appointments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["queue-appointments"],
    queryFn: async (): Promise<QueueAppointment[]> => {
      // Use the secure view that excludes PII (phone, email)
      const { data, error } = await supabase
        .from("appointments_queue")
        .select("*");

      if (error) {
        console.error("Error fetching queue:", error);
        return [];
      }

      return data as QueueAppointment[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds for TV display
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: {
      customer_name: string;
      customer_phone: string;
      customer_email?: string;
      service: string;
      appointment_date: string;
      appointment_time: string;
    }) => {
      // Don't use .select() as public users can't read back appointments (RLS)
      const { error } = await supabase
        .from("appointments")
        .insert([{ ...appointment, status: "confirmed" }]);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["queue-appointments"] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Appointment>;
    }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["queue-appointments"] });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["queue-appointments"] });
    },
  });
};
