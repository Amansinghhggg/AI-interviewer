import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, CreditCard, HelpCircle, LogOut, Menu, X, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function EmployerLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate("/login");
        } catch {
            toast.error("Logout failed");
        }
    };

    const handleNavItemClick = (path) => {
        navigate(path);
    };

    const navItems = [
        { label: "Dashboard", icon: Home, path: "/employer/dashboard" },
        ...(!user?.isVerified ? [{ label: "Verification Status", icon: ShieldAlert, path: "/employer/verification-pending" }] : []),
        { label: "New Campaign", icon: FileText, path: "/employer/create-interview" },
        { label: "Manage Subscriptions", icon: CreditCard, path: "/employer/subscriptions" },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-background-md3,var(--background))] text-[var(--color-on-background,var(--text-primary))] font-['Inter'] flex flex-col md:flex-row">
            
            {/* Mobile Header Bar (visible on < md screens) */}
            <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[var(--color-surface-container-lowest,var(--card))]/90 backdrop-blur-md border-b border-[var(--color-surface-variant,var(--border))]">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-md3)] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[var(--color-primary-md3)]/30">
                        IA
                    </div>
                    <div>
                        <h1 className="text-xs font-black tracking-tight text-[var(--color-on-surface)] uppercase">InterviewOS</h1>
                        <p className="text-[9px] text-[var(--color-on-surface-variant)] uppercase tracking-widest font-bold">Employer Console</p>
                    </div>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-xl bg-[var(--color-surface-variant)]/50 text-[var(--color-on-surface)] hover:text-[var(--color-primary-md3)] transition-colors border border-[var(--color-outline-variant)]/30"
                    aria-label="Toggle navigation menu"
                >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </header>

            {/* Mobile Dropdown Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-between p-4 animate-in fade-in duration-200">
                    <nav className="space-y-2 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-4 rounded-3xl shadow-2xl">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => {
                                    handleNavItemClick(item.path);
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                                    location.pathname === item.path
                                        ? 'bg-[var(--color-primary-md3)] text-white shadow-md shadow-[var(--color-primary-md3)]/30'
                                        : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]/50 hover:text-[var(--color-on-surface)]'
                                }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-4 rounded-3xl shadow-2xl space-y-2">
                        <button
                            onClick={() => {
                                navigate('/employer/profile');
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                                location.pathname === '/employer/profile'
                                    ? 'bg-[var(--color-primary-md3)] text-white'
                                    : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]/50'
                            }`}
                        >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop Expandable Sidebar (hidden on < md screens) */}
            <aside className="hidden md:flex group w-20 hover:w-72 border-r border-[var(--color-surface-variant,var(--border))] bg-[var(--color-surface-container-lowest,var(--card))] flex-col fixed bottom-0 top-0 left-0 z-40 transition-all duration-300 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 p-6 mb-4 min-w-[288px]">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-md3)] flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--color-primary-md3)]/30">
                        IA
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        <h1 className="text-sm font-black tracking-tight text-[var(--color-on-surface,var(--text-primary))]">InterviewOS</h1>
                        <p className="text-[10px] text-[var(--color-on-surface-variant,var(--text-secondary))] uppercase tracking-widest font-bold">Recruitment Suite</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 px-4 min-w-[288px]">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => handleNavItemClick(item.path)}
                            className={`w-full flex items-center gap-4 px-3 py-3 text-sm font-bold rounded-xl transition-all ${
                                location.pathname === item.path
                                    ? 'bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                                    : 'text-[var(--color-on-surface-variant,var(--text-secondary))] hover:bg-[var(--color-surface-variant,var(--border))]/50 hover:text-[var(--color-primary-md3)]'
                            }`}
                        >
                            <item.icon className="w-6 h-6 shrink-0" />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-[var(--color-surface-variant,var(--border))] space-y-2 min-w-[288px]">
                    <button
                        onClick={() => navigate('/employer/profile')}
                        className={`w-full flex items-center gap-4 px-3 py-3 text-sm font-bold rounded-xl transition-all ${
                            location.pathname === '/employer/profile'
                                ? 'bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                                : 'text-[var(--color-on-surface-variant,var(--text-secondary))] hover:bg-[var(--color-surface-variant,var(--border))]/50 hover:text-[var(--color-primary-md3)]'
                        }`}
                    >
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-6 h-6 rounded-full object-cover shrink-0" />
                        ) : (
                            <div className="w-6 h-6 shrink-0 rounded-full bg-[var(--color-primary-md3)]/20 text-[var(--color-primary-md3)] flex items-center justify-center text-[10px] font-black uppercase border border-[var(--color-primary-md3)]/30">
                                {user?.name ? user.name.substring(0, 1) : "U"}
                            </div>
                        )}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-4 px-3 py-3 text-sm font-bold text-[var(--color-on-surface-variant,var(--text-secondary))] hover:bg-[var(--color-surface-variant,var(--border))]/50 hover:text-[var(--color-primary-md3)] rounded-xl transition-all">
                        <HelpCircle className="w-6 h-6 shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Contact Us</span>
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-3 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut className="w-6 h-6 shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-20 transition-all duration-300 w-full overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
}
