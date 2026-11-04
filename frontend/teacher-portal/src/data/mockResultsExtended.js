// Mock data for future Results & Reports integration
export const MOCK_EXAMS = [
  {
    id: 'exam-001',
    name: 'Midterm Chemistry',
    subject: 'Chemistry',
    category: 'Midterm',
    date: '2023-03-12',
    totalStudents: 30,
    attempted: 25,
    notAttempted: 5,
    avgScore: 78.4,
    highest: 95,
    lowest: 55,
    status: 'completed',
  },
  {
    id: 'exam-002',
    name: 'Final Physics',
    subject: 'Physics',
    category: 'Final',
    date: '2023-05-08',
    totalStudents: 30,
    attempted: 28,
    notAttempted: 2,
    avgScore: 82.1,
    highest: 100,
    lowest: 60,
    status: 'completed',
  },
];

// Student results per exam (keyed by exam id)
export const MOCK_EXAM_RESULTS = {
  'exam-001': [
    {
      studentId: 'stu-01',
      name: 'Alice Johnson',
      totalMarks: 85,
      maxMarks: 100,
      percentage: 85,
      correctAnswers: 34,
      incorrectAnswers: 6,
      unattempted: 0,
      passed: true,
      timeTaken: 1800, // seconds
    },
    {
      studentId: 'stu-02',
      name: 'Bob Smith',
      totalMarks: 72,
      maxMarks: 100,
      percentage: 72,
      correctAnswers: 30,
      incorrectAnswers: 10,
      unattempted: 0,
      passed: true,
      timeTaken: 2000,
    },
  ],
  'exam-002': [
    {
      studentId: 'stu-01',
      name: 'Alice Johnson',
      totalMarks: 92,
      maxMarks: 100,
      percentage: 92,
      correctAnswers: 38,
      incorrectAnswers: 2,
      unattempted: 0,
      passed: true,
      timeTaken: 1900,
    },
  ],
};

// Detailed answer review per exam per student
export const MOCK_ANSWER_REVIEWS = {
  'exam-001': {
    'stu-01': [
      {
        qNumber: 1,
        text: 'Which language is used to structure web pages?',
        options: [{ label: 'A', text: 'CSS' }, { label: 'B', text: 'HTML' }, { label: 'C', text: 'JavaScript' }, { label: 'D', text: 'Python' }],
        selected: 'B',
        correct: 'B',
        marksAwarded: 2,
        maxMarks: 2,
      },
      {
        qNumber: 2,
        text: 'Select all noble gases.',
        options: [{ label: 'A', text: 'Helium' }, { label: 'B', text: 'Oxygen' }, { label: 'C', text: 'Neon' }, { label: 'D', text: 'Nitrogen' }],
        selected: ['A', 'C'],
        correct: ['A', 'C'],
        marksAwarded: 2,
        maxMarks: 2,
      },
    ],
    'stu-02': [
      {
        qNumber: 1,
        text: 'Which language is used to structure web pages?',
        options: [{ label: 'A', text: 'CSS' }, { label: 'B', text: 'HTML' }, { label: 'C', text: 'JavaScript' }, { label: 'D', text: 'Python' }],
        selected: 'A',
        correct: 'B',
        marksAwarded: 0,
        maxMarks: 2,
      },
    ],
  },
  'exam-002': {
    'stu-01': [
      {
        qNumber: 1,
        text: 'What is the unit of force?',
        options: [{ label: 'A', text: 'Newton' }, { label: 'B', text: 'Joule' }, { label: 'C', text: 'Watt' }, { label: 'D', text: 'Pascal' }],
        selected: 'A',
        correct: 'A',
        marksAwarded: 2,
        maxMarks: 2,
      },
    ],
  },
};

