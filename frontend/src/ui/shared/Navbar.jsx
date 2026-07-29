import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] h-16 flex items-center">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm">
            <BrainCircuit className="w-5 h-5 text-[var(--primary)] transition-colors duration-300" />
          </div>
          <span className="text-lg font-bold text-[var(--text-primary)] tracking-wide">
            InterviewOS
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
