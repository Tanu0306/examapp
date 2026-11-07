CREATE TABLE IF NOT EXISTS public.exam_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id BIGINT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'joined'
    CHECK (status IN ('joined', 'connected', 'disconnected', 'submitted')),
  UNIQUE (exam_id, roll_number)
);
