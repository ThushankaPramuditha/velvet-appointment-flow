-- Temporarily allow public to update salon_config until auth is implemented
-- This should be replaced with proper staff authentication later
CREATE POLICY "Public can update salon config temporarily"
ON public.salon_config
FOR UPDATE
USING (true)
WITH CHECK (true);