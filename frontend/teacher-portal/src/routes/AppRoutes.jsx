import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { AuthPage } from '../pages/auth/AuthPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ModulePlaceholderPage } from '../pages/placeholder/ModulePlaceholderPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Route Guard (prevents visiting login if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthPage initialMode="login" />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthPage initialMode="register" />
          </PublicRoute>
        }
      />

      {/* Protected Teacher Portal App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Phase 2: Question Bank */}
        <Route
          path="questions"
          element={
            <ModulePlaceholderPage
              title="Module 2: Question Bank & Repository"
              phase="Phase 2 Target"
              description="A centralized repository for authoring, editing, categorizing, and organizing questions across all academic subjects and programming paradigms."
              features={[
                'Multi Choice Questions (MCQs) with single & multi-correct options',
                'Fill in the blanks with exact & case-insensitive matching',
                'Puzzles, Match the Following, and One-liner questions',
                'Isolated programming problems with I/O format, constraints, sample cases, and hidden test cases',
                'Subject/topic tagging, negative marking parameters, and difficulty ratings',
              ]}
            />
          }
        />

        {/* Phase 3: Examinations */}
        <Route
          path="exams"
          element={
            <ModulePlaceholderPage
              title="Module 3: Examination Management"
              phase="Phase 3 Target"
              description="Configure, schedule, and publish exams for local laboratory terminals with granular security and anti-cheat policies."
              features={[
                'Coding, Quiz, and Combined examination configurations',
                'Duration, start/end time windows, and negative marking rules',
                'Dynamic question shuffling and option randomization',
                'Violation threshold controls (warnings before auto-termination)',
                'Draft saving and publication status management',
              ]}
            />
          }
        />

        <Route
          path="exams/create"
          element={
            <ModulePlaceholderPage
              title="Module 3: Create Examination"
              phase="Phase 3 Target"
              description="Step-by-step wizard to compose a new assessment by selecting questions, setting time parameters, and assigning computer labs."
              features={[
                'Exam metadata and instructions definition',
                'Question selection basket from the Question Bank',
                'Lab room allocation and terminal seat limits',
                'Security policies (fullscreen enforcement, copy-paste lock)',
              ]}
            />
          }
        />

        {/* Phase 4: Live Monitoring */}
        <Route
          path="monitoring"
          element={
            <ModulePlaceholderPage
              title="Module 4 & 5: Live Examination Monitoring"
              phase="Phase 4 Target"
              description="Real-time supervision console for active LAN exams. Track terminal heartbeat, candidate progress, and security violations."
              features={[
                'Live candidate grid with status pills (Active, Waiting, Disconnected, Submitted, Terminated)',
                'Real-time attempted count and remaining countdown timers',
                'Instant violation alerts (tab switching, focus loss, paste attempts)',
                'Detailed individual student monitoring dossier with code execution telemetry',
                'Remote terminate or warning broadcast capabilities',
              ]}
            />
          }
        />

        {/* Phase 5: Evaluation */}
        <Route
          path="evaluation"
          element={
            <ModulePlaceholderPage
              title="Module 6: Assessment Evaluation"
              phase="Phase 5 Target"
              description="Automated scoring engine for objective questions and Docker sandbox evaluation for submitted code."
              features={[
                'Instant objective question grading (MCQs, blanks, puzzles, matching)',
                'Isolated compilation and test case execution for C, C++, and Python',
                'Manual review workspace for subjective one-liners and partial credit overrides',
              ]}
            />
          }
        />

        {/* Phase 5: Results */}
        <Route
          path="results"
          element={
            <ModulePlaceholderPage
              title="Module 7: Results & Reports"
              phase="Phase 5 Target"
              description="Performance analytics, grade sheets, question discrimination index, and printable transcripts."
              features={[
                'Student-wise scorecards with violation logs',
                'Class performance distribution and average metrics',
                'Question-wise difficulty and error frequency analysis',
                'CSV and PDF grade export for institutional records',
              ]}
            />
          }
        />

        {/* Phase 6: Student Roster */}
        <Route
          path="students"
          element={
            <ModulePlaceholderPage
              title="Module 8: Student Management & Credentials"
              phase="Phase 6 Target"
              description="Manage student rosters, generate LAN login credentials, and assign workstations."
              features={[
                'Batch CSV roster import with roll numbers and section mapping',
                'Generate temporary examination credentials for lab terminals',
                'Deactivate or reset student login sessions',
              ]}
            />
          }
        />

        {/* Phase 6: Settings */}
        <Route
          path="settings"
          element={
            <ModulePlaceholderPage
              title="System & LAN Configuration"
              phase="Phase 6 Target"
              description="Configure master LAN server settings, Docker container pools, and proctoring parameters."
              features={[
                'Local LAN Server IP (192.168.1.100) and port bindings',
                'Docker code execution resource limits (CPU/Memory per run)',
                'Default violation escalation rules',
              ]}
            />
          }
        />
      </Route>

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
