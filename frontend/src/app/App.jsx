import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../ui/shared/ProtectedRoute";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import EmployerDashboard from "../features/employer/EmployerDashboard";
import EmployerLayout from "../features/employer/EmployerLayout";
import CandidateDashboard from "../features/candidate/CandidateDashboard";
import CreateInterviewPage from "../features/employer/CreateInterviewPage";
import EditInterviewPage from "../features/employer/EditInterviewPage";
import InterviewDetailsPage from "../features/employer/InterviewDetailsPage";
import JoinInterviewPage from "../features/candidate/JoinInterviewPage";
import InterviewInstructionsPage from "../features/candidate/InterviewInstructionsPage";
import PreInterviewPage from "../features/candidate/PreInterviewPage";
import CandidateLayout from "../features/candidate/CandidateLayout";
import LiveInterviewPage from "../features/interview/LiveInterviewPage";
import EmployerInterviewResultPage from "../features/employer/EmployerInterviewResultPage";
import VoiceTestPage from "../features/interview/VoiceTestPage";
import ProfilePage from "../features/shared/ProfilePage";
import { Loader2 } from "lucide-react";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
          <p className="text-[var(--text-secondary)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
        <Route element={<ProtectedRoute role="employer"><EmployerLayout /></ProtectedRoute>}>
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/create-interview" element={<CreateInterviewPage />} />
          <Route path="/employer/interviews/:id/edit" element={<EditInterviewPage />} />
          <Route path="/employer/interviews/:id" element={<InterviewDetailsPage />} />
          <Route path="/employer/interviews/:id/results/:resultId" element={<EmployerInterviewResultPage />} />
          <Route path="/employer/profile" element={<ProfilePage />} />
        </Route>

        {/* Candidate Routes */}
        <Route element={<ProtectedRoute role="candidate"><CandidateLayout /></ProtectedRoute>}>
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/candidate/join" element={<JoinInterviewPage />} />
          <Route path="/candidate/interviews/:id" element={<InterviewInstructionsPage />} />
          <Route path="/candidate/interviews/:id/start" element={<PreInterviewPage />} />
          <Route path="/candidate/profile" element={<ProfilePage />} />
        </Route>
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
