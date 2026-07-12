import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">
              AI Interview
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-dark-200 hover:text-white hover:bg-dark-700 transition-all duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-dark-600">
                  <div className="text-right">
                    <p className="text-sm font-medium text-dark-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-dark-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-dark-400 hover:text-danger-400 hover:bg-dark-700 transition-all duration-200"
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
                  className="px-4 py-2 rounded-lg text-dark-200 hover:text-white hover:bg-dark-700 transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-lg shadow-primary-500/20"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 transition-all"
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
        <div className="md:hidden glass-light border-t border-dark-700 animate-fade-in-up">
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 mb-3 border-b border-dark-700">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-dark-400 capitalize">
                    {user.role}
                  </p>
                </div>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-dark-200 hover:text-white hover:bg-dark-700 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-danger-400 hover:bg-dark-700 transition-all w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-dark-200 hover:text-white hover:bg-dark-700 transition-all"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium text-center"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
