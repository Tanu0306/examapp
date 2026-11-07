export const gradeParticipant = async (client, examId, participantId) => {
  const questions = await client.query(
    `SELECT eq.id, eq.question_data, ea.selected_option_ids
     FROM exam_questions eq
     LEFT JOIN exam_answers ea
       ON ea.exam_question_id = eq.id AND ea.participant_id = $2
     WHERE eq.exam_id = $1
     ORDER BY eq.position`,
    [examId, participantId]
  );
  let score = 0;
  for (const row of questions.rows) {
    const correct = (row.question_data.options || [])
      .filter((option) => option.isCorrect)
      .map((option) => String(option.id))
      .sort();
    const selected = (row.selected_option_ids || []).map(String).sort();
    if (correct.length && correct.length === selected.length && correct.every((id, index) => id === selected[index])) {
      score += Number(row.question_data.marks || 0);
    }
  }
  return score;
};
