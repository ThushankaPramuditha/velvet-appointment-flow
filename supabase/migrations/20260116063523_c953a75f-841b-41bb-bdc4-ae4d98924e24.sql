-- Allow authenticated users to update salon_config (for managing services)
CREATE POLICY "Authenticated can update salon config"
ON public.salon_config
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);