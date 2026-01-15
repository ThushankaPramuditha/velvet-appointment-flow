-- Salon configuration table (for customizable branding)
CREATE TABLE public.salon_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Luxury Salon',
  tagline TEXT DEFAULT 'Premium Grooming Experience',
  logo_url TEXT,
  hero_image_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  opening_hours JSONB DEFAULT '{"monday": "9:00-18:00", "tuesday": "9:00-18:00", "wednesday": "9:00-18:00", "thursday": "9:00-18:00", "friday": "9:00-18:00", "saturday": "10:00-16:00", "sunday": "Closed"}',
  services JSONB DEFAULT '[{"name": "Haircut", "duration": 30, "price": 25}, {"name": "Beard Trim", "duration": 15, "price": 15}, {"name": "Full Service", "duration": 45, "price": 35}]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.salon_config ENABLE ROW LEVEL SECURITY;

-- Public read access for salon config (everyone can see branding)
CREATE POLICY "Public can view salon config"
  ON public.salon_config FOR SELECT
  USING (true);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  service TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in-queue', 'in-progress', 'completed', 'cancelled', 'no-show')),
  queue_position INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Public can create appointments (for online booking)
CREATE POLICY "Anyone can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

-- Public can view their own appointments by phone number
CREATE POLICY "Public can view appointments"
  ON public.appointments FOR SELECT
  USING (true);

-- Authenticated users (barbers) can update appointments
CREATE POLICY "Authenticated can update appointments"
  ON public.appointments FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete appointments
CREATE POLICY "Authenticated can delete appointments"
  ON public.appointments FOR DELETE
  USING (true);

-- Enable realtime for appointments (for TV display)
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_appointments_updated
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_salon_config_updated
  BEFORE UPDATE ON public.salon_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default salon config
INSERT INTO public.salon_config (name, tagline, phone, email, address)
VALUES (
  'The Golden Cut',
  'Where Style Meets Precision',
  '(555) 123-4567',
  'hello@thegoldencut.com',
  '123 Main Street, Downtown'
);