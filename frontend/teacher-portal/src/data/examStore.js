// Central mock data for Exams
// Each exam has an id, title, subject, status (ongoing, scheduled, draft, completed), date, time, duration, questionIds, lab, batch, and settings.

export const MOCK_EXAMS = [
  {
    id: "exam-001",
    title: "Midterm Chemistry",
    subject: "Chemistry",
    status: "ongoing",
    startDate: "2023-10-10",
    startTime: "10:00",
    durationMinutes: 90,
    questionIds: ["q-001", "q-005"],
    lab: "Lab A",
    batch: "Batch 2023",
    settings: {
      allowNavigation: false,
      allowScreenCapture: false,
      negativeMarking: false,
    },
  },
  {
    id: "exam-002",
    title: "Final Physics",
    subject: "Physics",
    status: "scheduled",
    startDate: "2023-12-20",
    startTime: "09:00",
    durationMinutes: 120,
    questionIds: ["q-010", "q-012"],
    lab: "Lab B",
    batch: "Batch 2024",
    settings: {
      allowNavigation: true,
      allowScreenCapture: false,
      negativeMarking: true,
    },
  },
  {
    id: "exam-003",
    title: "Quiz Mathematics",
    subject: "Mathematics",
    status: "draft",
    startDate: "",
    startTime: "",
    durationMinutes: 30,
    questionIds: [],
    lab: "Lab C",
    batch: "Batch 2023",
    settings: {
      allowNavigation: true,
      allowScreenCapture: true,
      negativeMarking: false,
    },
  },
];

// Utility to generate a new unique id
export const generateExamId = () => `exam-${Date.now()}`;

