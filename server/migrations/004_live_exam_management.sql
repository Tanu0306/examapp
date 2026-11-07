CREATE TABLE IF NOT EXISTS public.exam_live_sessions (
  exam_id BIGINT PRIMARY KEY REFERENCES public.exams(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'live', 'finished')),
  started_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.exam_participants
  ADD COLUMN IF NOT EXISTS extra_time_seconds INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS score NUMERIC(9, 2);

CREATE TABLE IF NOT EXISTS public.exam_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id BIGINT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.exam_participants(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS exam_violations_exam_time_idx
  ON public.exam_violations (exam_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.exam_answers (
  participant_id UUID NOT NULL REFERENCES public.exam_participants(id) ON DELETE CASCADE,
  exam_question_id UUID NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  selected_option_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (participant_id, exam_question_id)
);
