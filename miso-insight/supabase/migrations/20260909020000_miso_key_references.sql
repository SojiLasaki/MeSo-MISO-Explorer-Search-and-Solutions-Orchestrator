-- Store only an agent-safe reference to a credential. Subscription-key material
-- is intentionally never accepted by this application or persisted in Supabase.
CREATE TABLE public.miso_key_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (char_length(label) BETWEEN 1 AND 80),
  environment_variable TEXT NOT NULL CHECK (environment_variable ~ '^[A-Z][A-Z0-9_]{2,63}$'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX miso_key_references_user_label_idx
  ON public.miso_key_references (user_id, label);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.miso_key_references TO authenticated;
GRANT ALL ON public.miso_key_references TO service_role;

ALTER TABLE public.miso_key_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own MISO key references" ON public.miso_key_references
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
