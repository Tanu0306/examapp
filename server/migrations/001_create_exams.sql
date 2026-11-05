-- Adapt the existing exams table in place. This preserves all existing rows,
-- its bigint primary key, created_by foreign key, and existing columns.
ALTER TABLE public.exams
  ALTER COLUMN scheduled_at DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS lab TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS total_marks NUMERIC(9, 2) NOT NULL DEFAULT 0;

-- Questions are stored as ordered snapshots so bank changes do not rewrite
-- questions already included in an exam. Existing exams remain intact.
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id BIGINT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  source_question_id UUID,
  question_data JSONB NOT NULL
);
