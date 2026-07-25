import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../ui/shared/Navbar";
import ProtectedRoute from "../ui/shared/ProtectedRoute";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import EmployerDashboard from "../features/employer/EmployerDashboard";
import CandidateDashboard from "../features/candidate/CandidateDashboard";
import CreateInterviewPage from "../features/employer/CreateInterviewPage";
import EditInterviewPage from "../features/employer/EditInterviewPage";
import InterviewDetailsPage from "../features/employer/InterviewDetailsPage";
import JoinInterviewPage from "../features/candidate/JoinInterviewPage";
import InterviewInstructionsPage from "../features/candidate/InterviewInstructionsPage";
import PreInterviewPage from "../features/candidate/PreInterviewPage";
import LiveInterviewPage from "../features/interview/LiveInterviewPage";
import EmployerInterviewResultPage from "../features/employer/EmployerInterviewResultPage";
import VoiceTestPage from "../features/interview/VoiceTestPage";
import { Loader2 } from "lucide-react";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary-400" />
          <p className="text-dark-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Test Route */}
        <Route path="/test/voice" element={<VoiceTestPage />} />

        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to={
                  user.role === "employer"
                    ? "/employer/dashboard"
                    : "/candidate/dashboard"
                }
                replace
              />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate
                to={
                  user.role === "employer"
                    ? "/employer/dashboard"
                    : "/candidate/dashboard"
                }
                replace
              />
            ) : (
              <SignupPage />
            )
          }
        />

        {/* Employer Routes */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute role="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/create-interview"
          element={
            <ProtectedRoute role="employer">
              <CreateInterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/interviews/:id/edit"
          element={
            <ProtectedRoute role="employer">
              <EditInterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/interviews/:id"
          element={
            <ProtectedRoute role="employer">
              <InterviewDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/interviews/:id/results/:resultId"
          element={
            <ProtectedRoute role="employer">
              <EmployerInterviewResultPage />
            </ProtectedRoute>
          }
        />

        {/* Candidate Routes */}
        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute role="candidate">
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/join"
          element={
            <ProtectedRoute role="candidate">
              <JoinInterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/interviews/:id"
          element={
            <ProtectedRoute role="candidate">
              <InterviewInstructionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/interviews/:id/start"
          element={
            <ProtectedRoute role="candidate">
              <PreInterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/interviews/:id/live"
          element={
            <ProtectedRoute role="candidate">
              <LiveInterviewPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
