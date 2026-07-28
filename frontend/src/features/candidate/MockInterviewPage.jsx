import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import mockInterviewService from "../../services/mockInterview.service";
import {
  Bot,
  Sparkles,
  Clock,
  Briefcase,
  Layers,
  Award,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  X,
  Brain,
  MessageSquare,
  Zap,
  TrendingUp,
  FileText,
  History,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";

// Preset Role Options
const PRESET_ROLES = [
  "Full Stack Engineer",
  "Frontend Developer",
  "Backend Engineer",
  "Data Scientist",
  "DevOps / Cloud Engineer",
  "System Architect",
  "Product Manager"
];

// Preset Topic Options
const PRESET_TOPICS = [
  "React & Web Fundamentals",
  "Node.js & Express",
  "System Design & Scalability",
  "Python & Data Structures",
  "SQL & Database Indexing",
  "REST & GraphQL APIs",
  "Microservices Architecture",
  "Git & CI/CD Pipelines"
];

export default function MockInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "create"); // 'create' or 'history'

  // Creation Form State
  const [selectedRole, setSelectedRole] = useState(PRESET_ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([PRESET_TOPICS[0], PRESET_TOPICS[2]]);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("1-2 Years");
  const [duration, setDuration] = useState(15);
  const [instructions, setInstructions] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  // History & Pagination State
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [resumeableMocks, setResumeableMocks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  // Fetch History API (Fetches all candidate mock evaluations for accurate overall metrics)
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await mockInterviewService.getHistory({ page: 1, limit: 100 });
      if (data.success && Array.isArray(data.evaluations)) {
        setEvaluations(data.evaluations);
        setTotalCount(data.total || data.evaluations.length);
      } else {
        setEvaluations([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.warn("Could not fetch mock evaluation history:", err.message);
      setEvaluations([]);
      setTotalCount(0);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchResumeable = async () => {
    try {
      const data = await mockInterviewService.getResumeableMocks();
      if (data.success && Array.isArray(data.resumeable)) {
        setResumeableMocks(data.resumeable);
      }
    } catch (err) {
      console.warn("Could not fetch resumeable mocks:", err.message);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromQuery = searchParams.get("tab");
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
    } else if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.search, location.state]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
      fetchResumeable();
    }
  }, [activeTab]);

  // Toggle Topic Selection
  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  // Add Custom Topic
  const handleAddCustomTopic = (e) => {
    e.preventDefault();
    if (customTopicInput.trim() && !selectedTopics.includes(customTopicInput.trim())) {
      setSelectedTopics([...selectedTopics, customTopicInput.trim()]);
      setCustomTopicInput("");
    }
  };

  // Handle Real API Mock Creation Launch
  const handleCreateMockInterview = async () => {
    const roleToUse = selectedRole === "Custom Role" ? customRole : selectedRole;

    if (!roleToUse.trim()) {
      toast.error("Please enter or select a target job role");
      return;
    }

    if (duration < 5 || duration > 30) {
      toast.error("Interview duration must be between 5 and 30 minutes");
      return;
    }

    setIsLaunching(true);
    const toastId = toast.loading("Initializing AI Mock Interview...");

    try {
      const data = await mockInterviewService.createMockInterview({
        jobRole: roleToUse,
        topics: selectedTopics,
        experienceLevel,
        duration,
        instructions,
      });

      if (data.success && data.interview?._id) {
        toast.success("Mock Interview ready! Launching...", { id: toastId });
        // Navigate to mock-specific prepare page (combined details + system checks)
        navigate(`/candidate/mock-interview/${data.interview._id}/prepare`);
      } else {
        toast.error("Failed to create mock interview", { id: toastId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error launching mock interview", { id: toastId });
    } finally {
      setIsLaunching(false);
    }
  };

  // Recommendation Badge Color Helper
  const getRecommendationBadge = (recommendation) => {
    switch (recommendation) {
      case "STRONG_HIRE":
        return {
          label: "Strong Hire",
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        };
      case "HIRE":
        return {
          label: "Hire",
          bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
        };
      case "BORDERLINE":
        return {
          label: "Borderline",
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30"
        };
      case "NOT_EVALUATED":
        return {
          label: "Not Evaluated",
          bg: "bg-slate-500/10 text-slate-400 border-slate-500/30"
        };
      default:
        return {
          label: "Needs Work",
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/30"
        };
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent font-['Inter'] pb-24 text-[var(--color-on-surface,#dae2fd)]">
      <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8 space-y-8">

        {/* Top Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-md3)]/10 border border-[var(--color-primary-md3)]/30 text-[var(--color-primary-md3)] text-xs font-black uppercase tracking-widest mb-3">
              <Bot className="w-4 h-4" /> AI Practice Studio
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[var(--color-on-surface)]">
              Mock Interview Studio
            </h1>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1 font-medium">
              Train with adaptive AI questions, test your role readiness, and view detailed evaluation reports.
            </p>
          </div>

          {/* Tab Switcher Buttons */}
          <div className="flex items-center bg-[var(--color-surface-container-low)] p-1.5 rounded-2xl border border-[var(--color-surface-variant)] shadow-lg shrink-0">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "create"
                ? "bg-[var(--color-primary-md3)] text-white shadow-lg shadow-[var(--color-primary-md3)]/30"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                }`}
            >
              <Sparkles className="w-4 h-4" /> Create Mock
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "history"
                ? "bg-[var(--color-primary-md3)] text-white shadow-lg shadow-[var(--color-primary-md3)]/30"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                }`}
            >
              <History className="w-4 h-4" /> Past Mocks
            </button>
          </div>
        </motion.div>

        {/* Tab 1: Create Mock Interview */}
        {activeTab === "create" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Interactive Form */}
            <div className="lg:col-span-8 space-y-6">

              {/* Card 1: Target Role */}
              <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-md3)]/20 border border-[var(--color-primary-md3)]/30 flex items-center justify-center text-[var(--color-primary-md3)]">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                      Target Role
                    </h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)] font-semibold">
                      Select a role or specify a custom position you are interviewing for.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 mb-6">
                  {PRESET_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        if (role !== "Custom Role") setCustomRole("");
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedRole === role
                        ? "bg-[var(--color-primary-md3)] text-white border-[var(--color-primary-md3)] shadow-md shadow-[var(--color-primary-md3)]/20 scale-[1.02]"
                        : "bg-[var(--color-surface-container-high)]/40 text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/40 hover:border-[var(--color-primary-md3)]/40"
                        }`}
                    >
                      {role}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedRole("Custom Role")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedRole === "Custom Role"
                      ? "bg-[var(--color-primary-md3)] text-white border-[var(--color-primary-md3)] shadow-md shadow-[var(--color-primary-md3)]/20"
                      : "bg-[var(--color-surface-container-high)]/40 text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/40 hover:border-[var(--color-primary-md3)]/40"
                      }`}
                  >
                    + Custom Role
                  </button>
                </div>

                {selectedRole === "Custom Role" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <input
                      type="text"
                      placeholder="e.g. AI Engineer, Mobile Lead, Solutions Architect..."
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-primary-md3)]/50 px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none text-[var(--color-on-surface)]"
                    />
                  </motion.div>
                )}
              </div>

              {/* Card 2: Key Skills & Topics */}
              <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-6 md:p-8 rounded-3xl shadow-2xl relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/30 flex items-center justify-center text-[var(--color-secondary)]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                      Key Topics & Tech Stack
                    </h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)] font-semibold">
                      Choose the tech stack topics the AI interviewer will evaluate you on.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {PRESET_TOPICS.map((topic) => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${isSelected
                          ? "bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] border-[var(--color-secondary)]/40 shadow-sm"
                          : "bg-[var(--color-surface-container-high)]/30 text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30 hover:bg-[var(--color-surface-container-high)]/60"
                          }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {topic}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Topic Tag Creator */}
                <form onSubmit={handleAddCustomTopic} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Add custom topic (e.g. GraphQL, AWS Lambda)..."
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    className="flex-1 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--color-secondary)] text-[var(--color-on-surface)]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] border border-[var(--color-outline-variant)]/50 rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface)] transition-all"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Card 3: Experience Level & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Experience Level */}
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-6 rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--color-on-surface)]">
                    <Brain className="w-4 h-4 text-[var(--color-tertiary)]" /> Experience Level
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Fresher", "1-2 Years", "3-5 Years", "5+ Years"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setExperienceLevel(lvl)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${experienceLevel === lvl
                          ? "bg-[var(--color-tertiary)]/20 text-[var(--color-tertiary)] border-[var(--color-tertiary)]/40 shadow-sm"
                          : "bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30 hover:border-[var(--color-tertiary)]/30"
                          }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-6 rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--color-on-surface)]">
                    <Clock className="w-4 h-4 text-[var(--color-warning)]" /> Interview Duration (5 - 30 Mins)
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { mins: 5, label: "5 Mins" },
                      { mins: 15, label: "15 Mins" },
                      { mins: 30, label: "30 Mins" }
                    ].map((d) => (
                      <button
                        key={d.mins}
                        onClick={() => {
                          setDuration(d.mins);
                        }}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${duration === d.mins
                          ? "bg-[var(--color-warning)]/20 text-[var(--color-warning)] border-[var(--color-warning)]/40 shadow-sm"
                          : "bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30 hover:border-[var(--color-warning)]/30"
                          }`}
                      >
                        {d.label}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        if (duration === 5 || duration === 15 || duration === 30) setDuration(10);
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${duration !== 5 && duration !== 15 && duration !== 30
                        ? "bg-[var(--color-warning)]/20 text-[var(--color-warning)] border-[var(--color-warning)]/40 shadow-sm"
                        : "bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30 hover:border-[var(--color-warning)]/30"
                        }`}
                    >
                      Custom
                    </button>
                  </div>

                  {duration !== 5 && duration !== 15 && duration !== 30 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <div className="flex items-center gap-3 pt-2">
                        <input
                          type="number"
                          min={5}
                          max={30}
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          placeholder="Enter minutes (5-30)..."
                          className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-warning)]/50 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-on-surface)] focus:outline-none"
                        />
                        <span className="text-xs font-bold text-[var(--color-on-surface-variant)] shrink-0">Minutes (5-30)</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Card 4: Custom Instructions */}
              <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-6 rounded-3xl shadow-xl space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[var(--color-primary-md3)]" /> Specific Focus / Custom Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Focus heavily on system architecture tradeoffs, React rendering bottlenecks, and scenario-based coding design patterns..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 p-4 rounded-xl text-xs font-medium focus:outline-none focus:border-[var(--color-primary-md3)] text-[var(--color-on-surface)] resize-none"
                />
              </div>

            </div>

            {/* Right Column: Summary Card & Launch Action */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-b from-[var(--color-surface-container-low)] to-[var(--color-surface-container-lowest)] border border-[var(--color-primary-md3)]/40 p-6 md:p-8 rounded-3xl shadow-2xl sticky top-8 space-y-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-primary-md3)]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-on-surface)] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[var(--color-primary-md3)]" /> Interview Summary
                  </h3>

                  <div className="space-y-3 pt-2 text-xs border-t border-[var(--color-outline-variant)]/30">
                    <div className="flex justify-between py-1 border-b border-[var(--color-outline-variant)]/20">
                      <span className="text-[var(--color-on-surface-variant)] font-semibold">Target Role:</span>
                      <span className="font-bold text-[var(--color-on-surface)]">
                        {selectedRole === "Custom Role" ? customRole || "Custom Position" : selectedRole}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[var(--color-outline-variant)]/20">
                      <span className="text-[var(--color-on-surface-variant)] font-semibold">Experience Level:</span>
                      <span className="font-bold text-[var(--color-tertiary)]">{experienceLevel}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[var(--color-outline-variant)]/20">
                      <span className="text-[var(--color-on-surface-variant)] font-semibold">Duration:</span>
                      <span className="font-bold text-[var(--color-warning)]">{duration} Minutes</span>
                    </div>

                    <div className="py-1">
                      <span className="text-[var(--color-on-surface-variant)] font-semibold block mb-2">Selected Topics:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTopics.length > 0 ? (
                          selectedTopics.map((t) => (
                            <span key={t} className="px-2 py-1 rounded-lg bg-[var(--color-surface-container-high)] text-[10px] font-bold text-[var(--color-secondary)]">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[var(--color-on-surface-variant)] italic">General Technical Evaluation</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-outline-variant)]/30 space-y-3">
                    <button
                      onClick={handleCreateMockInterview}
                      disabled={isLaunching}
                      className="w-full py-4 bg-[var(--color-primary-md3)] hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-[var(--color-primary-md3)]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isLaunching ? (
                        <>Setting Up AI Interview...</>
                      ) : (
                        <>
                          <PlayCircle className="w-5 h-5" /> Launch Mock Interview
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-[var(--color-on-surface-variant)] font-medium">
                      Simulates a live voice/audio AI evaluation session.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab 2: Evaluation History & Past Results */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Functional Metrics & Visual Performance Chart Bar */}
            {(() => {
              const totalMocksCount = totalCount || evaluations.length || 0;
              const avgScore = evaluations.length > 0
                ? (evaluations.reduce((sum, e) => sum + (Number(e.scores?.overall) || 0), 0) / evaluations.length).toFixed(1)
                : "0.0";

              const evaluatedList = evaluations.filter((e) => e.recommendation !== "NOT_EVALUATED");
              const baseCount = evaluatedList.length || 1;

              const recCounts = evaluatedList.reduce((acc, e) => {
                const rec = e.recommendation || "BORDERLINE";
                if (rec === "STRONG_HIRE") acc.strong++;
                else if (rec === "HIRE") acc.hire++;
                else if (rec === "BORDERLINE") acc.borderline++;
                else acc.needsWork++;
                return acc;
              }, { strong: 0, hire: 0, borderline: 0, needsWork: 0 });

              const strongPct = evaluatedList.length > 0 ? Math.round((recCounts.strong / baseCount) * 100) : 0;
              const hirePct = evaluatedList.length > 0 ? Math.round((recCounts.hire / baseCount) * 100) : 0;
              const borderlinePct = evaluatedList.length > 0 ? Math.round((recCounts.borderline / baseCount) * 100) : 0;
              const needsWorkPct = evaluatedList.length > 0 ? Math.round((recCounts.needsWork / baseCount) * 100) : 0;

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Metric 1: Completed Mocks */}
                  <div className="lg:col-span-3 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-5 rounded-2xl flex items-center gap-4 shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-md3)]/20 border border-[var(--color-primary-md3)]/30 flex items-center justify-center text-[var(--color-primary-md3)]">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[var(--color-on-surface)]">{totalMocksCount}</div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)]">Completed Mocks</div>
                    </div>
                  </div>

                  {/* Metric 2: Average Overall Score */}
                  <div className="lg:col-span-3 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-5 rounded-2xl flex items-center gap-4 shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-emerald-400">{avgScore} <span className="text-xs text-[var(--color-on-surface-variant)] font-normal">/ 10</span></div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)]">Average Score</div>
                    </div>
                  </div>

                  {/* Visual Graph: Recommendation Distribution Bar Chart */}
                  <div className="lg:col-span-6 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-5 rounded-2xl shadow-lg space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                      <span className="flex items-center gap-1.5 text-[var(--color-on-surface)]"><TrendingUp className="w-3.5 h-3.5 text-[var(--color-secondary)]" /> Performance Breakdown</span>
                      <span>{evaluations.length} Reports</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {/* Strong Hire Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-emerald-400">
                          <span>Strong Hire</span>
                          <span>{recCounts.strong} ({strongPct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-surface-container-highest)] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${strongPct}%` }} className="h-full bg-emerald-400 rounded-full" />
                        </div>
                      </div>

                      {/* Hire Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-[var(--color-primary-md3)]">
                          <span>Hire</span>
                          <span>{recCounts.hire} ({hirePct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-surface-container-highest)] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${hirePct}%` }} className="h-full bg-[var(--color-primary-md3)] rounded-full" />
                        </div>
                      </div>

                      {/* Borderline Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-[var(--color-warning)]">
                          <span>Borderline</span>
                          <span>{recCounts.borderline} ({borderlinePct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-surface-container-highest)] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${borderlinePct}%` }} className="h-full bg-[var(--color-warning)] rounded-full" />
                        </div>
                      </div>

                      {/* Needs Work Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-rose-400">
                          <span>Needs Work</span>
                          <span>{recCounts.needsWork} ({needsWorkPct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-surface-container-highest)] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${needsWorkPct}%` }} className="h-full bg-rose-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Section: Resume Incomplete Mock Interviews (if any exist) */}
            {resumeableMocks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning)] animate-pulse" />
                  <h2 className="text-lg font-black uppercase tracking-wider text-[var(--color-on-surface)]">
                    Resume Incomplete / Pending Mocks ({resumeableMocks.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resumeableMocks.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[var(--color-surface-container-low)] border border-[var(--color-warning)]/40 hover:border-[var(--color-warning)] transition-all rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20">
                            {item.status || "In Progress"}
                          </span>
                          <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-on-surface)] mt-2">
                            {item.jobRole || item.title}
                          </h3>
                        </div>
                        <span className="text-[10px] text-[var(--color-on-surface-variant)] font-bold">
                          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-on-surface-variant)] font-semibold">
                        <span className="flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5 text-[var(--color-tertiary)]" /> {item.experienceLevel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[var(--color-warning)]" /> {item.duration} Mins
                        </span>
                      </div>

                      {item.topics && item.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.topics.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-[var(--color-surface-container-high)] text-[9px] font-bold text-[var(--color-secondary)]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/candidate/mock-interview/${item.id}/prepare`)}
                        className="w-full py-2.5 bg-[var(--color-warning)] hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                      >
                        <PlayCircle className="w-4 h-4" /> Resume Mock Interview
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of Evaluation Cards */}
            <div className="space-y-6">
              <h2 className="text-lg font-black uppercase tracking-wider text-[var(--color-on-surface)]">
                Evaluation History & Reports
              </h2>

              {evaluations.length === 0 ? (
                <div className="bg-gradient-to-b from-[var(--color-surface-container-low)] to-[var(--color-surface-container-lowest)] border border-[var(--color-primary-md3)]/30 p-10 md:p-14 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-primary-md3)]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-md3)]/20 border border-[var(--color-primary-md3)]/40 flex items-center justify-center text-[var(--color-primary-md3)] mx-auto shadow-inner">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2 relative z-10">
                    <h3 className="text-xl font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                      No Mock Evaluations Attempted Yet
                    </h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed font-semibold">
                      Boost your interview readiness! Practice live voice AI interviews tailored to your target role, receive instant question-by-question feedback, and land your dream job with confidence.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="px-8 py-3.5 bg-[var(--color-primary-md3)] hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-[var(--color-primary-md3)]/30 inline-flex items-center gap-2 transition-all relative z-10"
                  >
                    <PlayCircle className="w-4.5 h-4.5" /> Start Your First Mock Interview
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {evaluations.map((item) => {
                    const badge = getRecommendationBadge(item.recommendation);
                    return (
                      <div
                        key={item.id}
                        className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] hover:border-[var(--color-primary-md3)]/40 transition-all rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                          {/* Role & Date Info */}
                          <div className="space-y-3 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badge.bg}`}>
                                {badge.label}
                              </span>
                              <span className="text-xs text-[var(--color-on-surface-variant)] font-bold uppercase tracking-wider">
                                {new Date(item.evaluatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>

                            <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                              {item.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--color-on-surface-variant)]">
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-[var(--color-primary-md3)]" /> {item.jobRole}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Brain className="w-4 h-4 text-[var(--color-tertiary)]" /> {item.experienceLevel}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-[var(--color-warning)]" /> {item.duration} Mins
                              </span>
                            </div>

                            {/* Topics Covered Chips */}
                            {item.topics && item.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {item.topics.map((t, tIdx) => (
                                  <span key={tIdx} className="px-2.5 py-0.5 rounded-lg bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/20 text-[10px] font-bold text-[var(--color-secondary)]">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Overall Score Badge / Action */}
                          <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between border-t md:border-t-0 border-[var(--color-outline-variant)]/20 pt-4 md:pt-0">
                            {item.recommendation === "NOT_EVALUATED" ? (
                              <div className="px-4 py-2.5 rounded-xl bg-slate-500/10 border border-slate-500/30 text-slate-400 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-slate-400" />
                                Not Evaluated
                              </div>
                            ) : (
                              <>
                                <div className="text-center">
                                  <div className="text-3xl font-black text-[var(--color-primary-md3)]">
                                    {item.scores?.overall || "0"}
                                    <span className="text-xs text-[var(--color-on-surface-variant)] font-normal"> / 10</span>
                                  </div>
                                  <div className="text-[9px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">Overall Score</div>
                                </div>

                                <button
                                  onClick={() => setSelectedEvaluation(item)}
                                  className="px-5 py-3 bg-[var(--color-primary-md3)]/10 hover:bg-[var(--color-primary-md3)] text-[var(--color-primary-md3)] hover:text-white border border-[var(--color-primary-md3)]/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all"
                                >
                                  <FileText className="w-4 h-4" /> View Report
                                </button>
                              </>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}


            </div>

          </motion.div>
        )}

      </div>

      {/* Detailed Evaluation Report Modal */}
      <AnimatePresence>
        {selectedEvaluation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--color-surface-container-low,#131b2e)] border border-[var(--color-surface-variant,#2d3449)] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-2xl p-6 md:p-8 space-y-8 relative text-[var(--color-on-surface,#dae2fd)]"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-6 border-b border-[var(--color-outline-variant)]/30">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRecommendationBadge(selectedEvaluation.recommendation).bg}`}>
                      {getRecommendationBadge(selectedEvaluation.recommendation).label}
                    </span>
                    <span className="text-xs text-[var(--color-on-surface-variant)] font-bold">
                      {new Date(selectedEvaluation.evaluatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--color-on-surface)]">
                    {selectedEvaluation.title}
                  </h2>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-semibold">
                    {selectedEvaluation.jobRole} • {selectedEvaluation.experienceLevel}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvaluation(null)}
                  className="p-2 rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scores Overview Radar / Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/20">
                  <div className="text-xl font-black text-[var(--color-primary-md3)]">{selectedEvaluation.scores.overall}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Overall</div>
                </div>
                <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/20">
                  <div className="text-xl font-black text-[var(--color-secondary)]">{selectedEvaluation.scores.technical}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Technical</div>
                </div>
                <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/20">
                  <div className="text-xl font-black text-[var(--color-tertiary)]">{selectedEvaluation.scores.communication}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Communication</div>
                </div>
                <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/20">
                  <div className="text-xl font-black text-[var(--color-warning)]">{selectedEvaluation.scores.problemSolving}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Problem Solving</div>
                </div>
                <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/20 col-span-2 sm:col-span-1">
                  <div className="text-xl font-black text-indigo-400">{selectedEvaluation.scores.confidence}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Confidence</div>
                </div>
              </div>

              {/* Executive AI Reasoning */}
              <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 p-6 rounded-2xl space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-primary-md3)] flex items-center gap-2">
                  <Brain className="w-4 h-4" /> AI Evaluator Assessment
                </h4>
                <p className="text-xs font-medium leading-relaxed text-[var(--color-on-surface-variant)]">
                  {selectedEvaluation.reasoning}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[var(--color-surface-container-lowest)] border border-emerald-500/20 p-6 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {(selectedEvaluation?.strengths || []).map((s, idx) => (
                      <li key={idx} className="text-xs text-[var(--color-on-surface-variant)] font-semibold flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[var(--color-surface-container-lowest)] border border-amber-500/20 p-6 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Areas to Polish
                  </h4>
                  <ul className="space-y-2">
                    {(selectedEvaluation?.weaknesses || []).map((w, idx) => (
                      <li key={idx} className="text-xs text-[var(--color-on-surface-variant)] font-semibold flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Question Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)]">
                  Question-by-Question AI Analysis
                </h4>

                <div className="space-y-4">
                  {(selectedEvaluation?.questionBreakdown || []).map((q, idx) => (
                    <div key={q.questionId || idx} className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 px-2.5 py-1 rounded-md">
                          Q{idx + 1} • {q.topic || "General"}
                        </span>
                        <div className="text-xs font-black text-[var(--color-primary-md3)]">
                          Score: {q.scores?.technical || q.score || 0} / 10
                        </div>
                      </div>

                      <p className="text-xs font-bold text-[var(--color-on-surface)]">
                        {q.question}
                      </p>

                      {q.answer && (
                        <div className="bg-[var(--color-surface-container-high)]/30 p-3 rounded-xl text-xs text-[var(--color-on-surface-variant)] italic">
                          "{q.answer}"
                        </div>
                      )}

                      <p className="text-xs font-medium text-emerald-400/90 pt-1">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--color-on-surface-variant)] block">AI Feedback:</span>
                        {q.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
