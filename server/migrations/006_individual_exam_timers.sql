ALTER TABLE public.exam_participants
  ADD COLUMN IF NOT EXISTS attempt_ends_at TIMESTAMPTZ;

ALTER TABLE public.exam_live_sessions
  ADD COLUMN IF NOT EXISTS duration_adjustment_seconds INTEGER NOT NULL DEFAULT 0;

UPDATE public.exam_participants AS participant
SET attempt_ends_at = live_session.ends_at
FROM public.exam_live_sessions AS live_session
WHERE participant.exam_id = live_session.exam_id
  AND participant.attempt_started_at IS NOT NULL
  AND participant.attempt_ends_at IS NULL
  AND live_session.ends_at IS NOT NULL;
