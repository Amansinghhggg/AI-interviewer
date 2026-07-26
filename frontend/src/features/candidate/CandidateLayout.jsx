import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Key, HelpCircle, LogOut, Bot, CreditCard, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function CandidateLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate("/login");
        } catch {
            toast.error("Logout failed");
        }
    };

    return (
        <div className="flex min-h-screen bg-[var(--color-background-md3,var(--background))] text-[var(--color-on-background,var(--text-primary))] font-['Inter']">
            
            {/* Slidable Fixed Sidebar */}
            <aside className="group w-20 hover:w-72 border-r border-[var(--color-surface-variant,var(--border))] bg-[var(--color-surface-container-lowest,var(--card))] flex flex-col fixed bottom-0 top-0 left-0 z-40 transition-all duration-300 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 p-6 mb-4 min-w-[288px]">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-md3)] flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--color-primary-md3)]/30">
                        IA
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        <h1 className="text-sm font-black tracking-tight text-[var(--color-on-surface,var(--text-primary))]">Intervu AI</h1>
                        <p className="text-[10px] text-[var(--color-on-surface-variant,var(--text-secondary))] uppercase tracking-widest font-bold">Candidate Portal</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 px-4 min-w-[288px]">
                    <button onClick={() => navigate('/candidate/dashboard')} className={`w-full flex items-center gap-4 px-3 py-3 text-sm font-bold rounded-xl transition-all ${location.pathname === '/candidate/dashboard' ? 'bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'text-[var(--color-on-surface-variant,var(--text-secondary))] hover:bg-[var(--color-surface-variant,var(--border))]/50 hover:text-[var(--color-primary-md3)]'}`}>
                        <Home className="w-6 h-6 shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Dashboard</span>
                    </button>
                    
                    <button onClick={() => navigate('/candidate/join')} className={`w-full flex items-center gap-4 px-3 py-3 text-sm font-bold rounded-xl transition-all ${location.pathname === '/candidate/join' ? 'bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'text-[var(--color-on-surface-variant,var(--text-secondary))] hover:bg-[var(--color-surface-variant,var(--border))]/50 hover:text-[var(--color-primary-md3)]'}`}>
                        <Key className="w-6 h-6 shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Join via Code</span>
                    </button>

                    <button onClick={() => navigate('/candidate/mock-interview')} className={`w-full flex items-center gap-4 px-3 py-3 text-sm font-bold rounded-xl transition-all ${location.pathname === '/candidate/mock-interview' ? 'bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'text-[var(--color-on-surface-variant,var(--text-secondary))] hover:bg-[var(--color-surface-variant,var(--border))]/50 hover:text-[var(--color-primary-md3)]'}`}>
                        <Bot className="w-6 h-6 shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Give A Mock Interview</span>
                    </button>

                    <button onClick={() => navigate('/candidate/subscriptions')} className={`w-full flex items-center gap-4 px-3 py-3 text-sm font-bold rounded-xl transition-all ${location.pathname === '/candidate/subscriptions' ? 'bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'text-[var(--color-on-surface-variant,var(--text-secondary))] hover:bg-[var(--color-surface-variant,var(--border))]/50 hover:text-[var(--color-primary-md3)]'}`}>
                        <CreditCard className="w-6 h-6 shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Manage Subscriptions</span>
                    </button>

                </nav>

                <div className="p-4 border-t border-[var(--color-surface-variant,var(--border))] space-y-2 min-w-[288px]">
                    <button onClick={() => navigate('/candidate/profile')} className={`w-full flex items-center gap-4 px-3 py-3 text-sm font-bold rounded-xl transition-all ${location.pathname === '/candidate/profile' ? 'bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'text-[var(--color-on-surface-variant,var(--text-secondary))] hover:bg-[var(--color-surface-variant,var(--border))]/50 hover:text-[var(--color-primary-md3)]'}`}>
                        <User className="w-6 h-6 shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-4 px-3 py-3 text-sm font-bold text-[var(--color-on-surface-variant,var(--text-secondary))] hover:bg-[var(--color-surface-variant,var(--border))]/50 hover:text-[var(--color-primary-md3)] rounded-xl transition-all">
                        <HelpCircle className="w-6 h-6 shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Help & Support</span>
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-3 py-3 text-sm font-bold text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-xl transition-all">
                        <LogOut className="w-6 h-6 shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-20 transition-all duration-300 relative z-10">
                <Outlet />
            </main>
        </div>
    );
}
