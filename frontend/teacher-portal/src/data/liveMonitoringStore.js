// Mock data for Live Monitoring
export const MOCK_LIVE_SESSIONS = [
  {
    examId: "exam-001",
    examTitle: "Midterm Chemistry",
    connectedStudents: [
      { id: "stu-01", name: "Alice", roll: "101", terminalId: "T-01", progress: 70, remainingMinutes: 20 },
      { id: "stu-02", name: "Bob", roll: "102", terminalId: "T-02", progress: 45, remainingMinutes: 40 },
    ],
    violationLogs: [
      { timestamp: "2023-10-10T10:15:00", type: "Tab Switch", details: "Student switched tabs" },
      { timestamp: "2023-10-10T10:20:00", type: "Copy Paste", details: "Attempted copy" },
    ],
  },
];

