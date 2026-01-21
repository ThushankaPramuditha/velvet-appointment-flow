-- Create a view to safely expose user data for admin management
-- This excludes sensitive auth data and only shows what's needed
CREATE OR REPLACE VIEW public.admin_users_view
WITH (security_invoker=on) AS
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.last_sign_in_at,
  au.raw_user_meta_data->>'name' as name,
  COALESCE(
    (SELECT array_agg(ur.role::text) FROM public.user_roles ur WHERE ur.user_id = au.id),
    ARRAY[]::text[]
  ) as roles
FROM auth.users au;

-- Allow admins to select from this view
CREATE POLICY "Admins can view users" 
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop the existing restrictive policy and create a broader one for admins
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Admins can insert new roles
CREATE POLICY "Admins can insert roles" 
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete roles
CREATE POLICY "Admins can delete roles" 
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));