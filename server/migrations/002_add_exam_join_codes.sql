ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS join_code TEXT;

-- Give exams published before this migration a join code as well.
UPDATE public.exams
SET join_code = replace(gen_random_uuid()::text, '-', '')
WHERE status = 'published' AND join_code IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS exams_join_code_unique
  ON public.exams (join_code)
  WHERE join_code IS NOT NULL;
