import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  BrainCircuit,
  MessageSquareWarning,
  Users,
  LogOut,
  Menu,
  X,
  User,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Admin logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const navItems = [
    { label: "Admin Console", icon: LayoutDashboard, path: "/admin" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 font-['Inter'] flex flex-col md:flex-row selection:bg-purple-500/30">
      
      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0f1422]/90 backdrop-blur-xl border-b border-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-purple-500/20">
            AD
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              IntervuOS <Sparkles className="w-3 h-3 text-purple-400" />
            </h1>
            <p className="text-[9px] text-purple-400 uppercase tracking-widest font-bold">
              Single Admin Portal
            </p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-purple-500/10 text-purple-300 hover:text-white transition-colors border border-purple-500/20"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-black/80 backdrop-blur-md flex flex-col justify-between p-4 overflow-y-auto max-h-[calc(100vh-57px)] animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/30 text-purple-200 flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.substring(0, 1) : "A"}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user?.name || "Admin"}</p>
                  <p className="text-xs text-purple-300/70">{user?.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                ROOT ADMIN
              </span>
            </div>

            <nav className="space-y-2 bg-[#0f1422] border border-purple-500/10 p-3 rounded-2xl">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                      : "text-slate-400 hover:bg-purple-500/10 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      )}

      {/* Desktop Expandable Sidebar */}
      <aside className="hidden md:flex group w-20 hover:w-72 border-r border-purple-500/10 bg-[#0f1422] flex-col fixed bottom-0 top-0 left-0 z-40 transition-all duration-300 overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 p-5 mb-2 min-w-[288px]">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/30">
            AD
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              IntervuOS <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            </h1>
            <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
              Root Control Center
            </p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-2 px-3 min-w-[288px]">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-3.5 py-3 text-sm font-bold rounded-xl transition-all ${
                location.pathname === item.path
                  ? "bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                  : "text-slate-400 hover:bg-purple-500/10 hover:text-purple-300"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0 text-purple-400" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Admin User Footer Card */}
        <div className="p-3 border-t border-purple-500/10 space-y-2 min-w-[288px]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/10">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Admin Profile"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-purple-500/30"
              />
            ) : (
              <div className="w-8 h-8 shrink-0 rounded-full bg-purple-600/20 text-purple-300 flex items-center justify-center text-xs font-black uppercase border border-purple-500/30">
                {user?.name ? user.name.substring(0, 1) : "A"}
              </div>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Admin Owner"}</p>
              <p className="text-[10px] text-purple-300/70 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-3.5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-20 transition-all duration-300 w-full overflow-x-hidden p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
