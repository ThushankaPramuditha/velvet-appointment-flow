-- Create a secure view for TV display that hides PII (phone, email)
CREATE VIEW public.appointments_queue
WITH (security_invoker = on) AS
SELECT 
    id,
    customer_name,
    appointment_time,
    appointment_date,
    service,
    status,
    queue_position
FROM public.appointments
WHERE appointment_date = CURRENT_DATE 
  AND status IN ('in-queue', 'in-progress')
ORDER BY queue_position ASC NULLS LAST, appointment_time ASC;