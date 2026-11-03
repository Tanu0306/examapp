import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { AuthPage } from '../pages/auth/AuthPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { QuestionsPage } from '../pages/questions/QuestionsPage';
import { CreateExamPage } from '../pages/exams/CreateExamPage';
import { AllExamsPage } from '../pages/exams/AllExamsPage';
import { LiveMonitoringPage } from '../pages/exams/LiveMonitoringPage';
import { EvaluationPage } from '../pages/evaluation/EvaluationPage';
import { ResultsPage } from '../pages/results/ResultsPage';
import { StudentRosterPage } from '../pages/roster/StudentRosterPage';
import { SettingsPage } from '../pages/settings/SettingsPage';



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
          element={<QuestionsPage />}
        />

        {/* Phase 3: Examinations */}
        <Route
          path="exams"
          element={<AllExamsPage />}
        />

        <Route
          path="exams/create"
          element={<CreateExamPage />}
        />

        {/* Phase 4: Live Monitoring */}
        <Route
          path="monitoring"
          element={<LiveMonitoringPage />}
        />

        {/* Phase 5: Evaluation */}
        <Route
          path="evaluation"
          element={<EvaluationPage />}
        />

        {/* Phase 5: Results */}
        <Route
          path="results"
          element={<ResultsPage />}
        />

        {/* Phase 6: Student Roster */}
        <Route
          path="students"
          element={<StudentRosterPage />}
        />
        {/* Phase 6: Settings */}
        <Route
          path="settings"
          element={<SettingsPage />}
        />
      </Route>

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
