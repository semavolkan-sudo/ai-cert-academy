
CREATE TABLE public.admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_credentials TO service_role;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admin_password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_password_resets TO service_role;
ALTER TABLE public.admin_password_resets ENABLE ROW LEVEL SECURITY;
CREATE INDEX admin_password_resets_token_idx ON public.admin_password_resets (token_hash);
CREATE INDEX admin_password_resets_email_created_idx ON public.admin_password_resets (email, created_at DESC);

INSERT INTO public.admin_credentials (email, password_hash)
VALUES ('admin@aicert.com', '$2b$10$pPDaFgTxzou2gM65vBUykur7pjA6P8teeHtw9jo6.r7JPP8Bw8dCG')
ON CONFLICT (email) DO NOTHING;
