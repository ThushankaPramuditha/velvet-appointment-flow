-- 1. Create an enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'barber', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Create function to check if user is staff (admin or barber)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'barber')
  )
$$;

-- 6. RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Drop overly permissive policies on appointments
DROP POLICY IF EXISTS "Authenticated can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated can delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public can view appointments" ON public.appointments;

-- 8. Create secure policies for appointments

-- Public can only view limited fields (for TV display) - using a restrictive approach
-- We'll create a view for the TV display instead of exposing all data publicly
CREATE POLICY "Staff can view all appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- Allow public to see only today's queue appointments (minimal data exposure)
-- This is for the TV display which shows the waiting list
CREATE POLICY "Public can view today queue"
ON public.appointments
FOR SELECT
USING (
  appointment_date = CURRENT_DATE 
  AND status IN ('in-queue', 'in-progress')
);

-- Only staff can update appointments
CREATE POLICY "Staff can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- Only staff can delete appointments
CREATE POLICY "Staff can delete appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

-- 9. Update salon_config policy to only allow staff updates
DROP POLICY IF EXISTS "Authenticated can update salon config" ON public.salon_config;

CREATE POLICY "Staff can update salon config"
ON public.salon_config
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));