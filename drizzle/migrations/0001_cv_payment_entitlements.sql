CREATE TABLE public.cv_entitlements (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, reference text NOT NULL UNIQUE, plan text NOT NULL CHECK (plan IN ('week','month','year')), expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.cv_entitlements TO authenticated;
GRANT ALL ON public.cv_entitlements TO service_role;
ALTER TABLE public.cv_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own CV purchases" ON public.cv_entitlements FOR SELECT TO authenticated USING (auth.uid() = user_id);