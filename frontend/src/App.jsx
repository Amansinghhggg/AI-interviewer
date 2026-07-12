import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EmployerDashboard from "./pages/EmployerDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import CreateInterviewPage from "./pages/CreateInterviewPage";
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
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
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

        {/* Candidate Routes */}
        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute role="candidate">
              <CandidateDashboard />
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
