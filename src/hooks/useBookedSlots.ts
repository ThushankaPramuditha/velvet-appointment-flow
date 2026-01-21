import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";

export interface BookedSlot {
  appointment_date: string;
  appointment_time: string;
}

export const useBookedSlots = () => {
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["booked-slots", today, tomorrow],
    queryFn: async (): Promise<BookedSlot[]> => {
      // Query the public queue view to get booked slots (no auth required)
      const { data, error } = await supabase
        .from("appointments_queue")
        .select("appointment_date, appointment_time")
        .in("appointment_date", [today, tomorrow])
        .in("status", ["confirmed", "pending", "in-progress"]);

      if (error) {
        console.error("Error fetching booked slots:", error);
        return [];
      }

      return data as BookedSlot[];
    },
    staleTime: 30000, // Cache for 30 seconds
  });
};

export const isSlotBooked = (
  bookedSlots: BookedSlot[],
  date: string,
  time: string
): boolean => {
  return bookedSlots.some(
    (slot) => slot.appointment_date === date && slot.appointment_time === `${time}:00`
  );
};
