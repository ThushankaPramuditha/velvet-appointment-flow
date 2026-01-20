-- Fix: Change the INSERT policy from RESTRICTIVE to PERMISSIVE so public bookings work
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;

CREATE POLICY "Anyone can create appointments"
ON public.appointments
FOR INSERT
TO public
WITH CHECK (true);