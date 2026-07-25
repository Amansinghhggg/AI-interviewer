import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LogOut,
  LayoutDashboard,
  BrainCircuit,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const dashboardPath =
    user?.role === "employer"
      ? "/employer/dashboard"
      : "/candidate/dashboard";

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? dashboardPath : "/login"} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-lg">
              <BrainCircuit className="w-5 h-5 text-[var(--color-accent-violet)] group-hover:text-[var(--color-accent-blue)] transition-colors duration-300" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide hidden sm:block">
              Intervu
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-4 ml-2">
                  <div className="text-right flex flex-col justify-center">
                    <p className="text-sm font-medium text-white leading-tight">
                      {user.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] capitalize leading-tight mt-0.5">
                      {user.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] hover:bg-[rgba(244,63,94,0.1)] transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="btn-secondary"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-elevated)] transition-all"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-[var(--color-border-subtle)] animate-fade-in-up">
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-3 mb-3 border-b border-[var(--color-border-default)]">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] capitalize mt-1">
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-[var(--color-accent-red)] hover:bg-[rgba(244,63,94,0.1)] transition-all w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary text-center w-full block"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-center w-full block"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
