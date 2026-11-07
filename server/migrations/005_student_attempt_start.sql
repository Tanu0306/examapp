ALTER TABLE public.exam_participants
  ADD COLUMN IF NOT EXISTS attempt_started_at TIMESTAMPTZ;
