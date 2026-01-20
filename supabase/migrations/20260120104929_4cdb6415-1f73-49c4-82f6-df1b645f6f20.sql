-- Fix #1: Remove the overly permissive public update policy on salon_config
DROP POLICY IF EXISTS "Public can update salon config temporarily" ON public.salon_config;

-- Fix #2: Recreate appointments_queue view with security_invoker to respect base table RLS
DROP VIEW IF EXISTS public.appointments_queue;

CREATE VIEW public.appointments_queue
WITH (security_invoker=on) AS
SELECT 
  id,
  customer_name,
  service,
  appointment_date,
  appointment_time,
  status,
  queue_position
FROM public.appointments
WHERE status IN ('pending', 'in-progress', 'queued', 'confirmed')
ORDER BY 
  CASE WHEN status = 'in-progress' THEN 0 ELSE 1 END,
  queue_position NULLS LAST,
  appointment_time;