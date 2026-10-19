CREATE TABLE public.explanations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled',
  code text NOT NULL,
  language text NOT NULL,
  difficulty text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  explanation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.explanations TO authenticated;
GRANT ALL ON public.explanations TO service_role;
ALTER TABLE public.explanations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.explanations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.explanations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.explanations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX explanations_user_created ON public.explanations(user_id, created_at DESC);