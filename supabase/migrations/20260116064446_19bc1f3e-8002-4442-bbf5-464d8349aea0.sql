-- Drop the overly permissive public policy that exposes PII
DROP POLICY IF EXISTS "Public can view today queue" ON public.appointments;