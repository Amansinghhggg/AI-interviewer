import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Clock,
  Tag,
  AlignLeft,
  BookOpen,
  Plus,
  Sparkles,
  Briefcase,
  ShieldAlert,
  UserPlus,
  Upload,
  FileSpreadsheet,
  User,
  ListFilter,
  Mail,
  Trash2,
  X,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../../ui/primitives/PageHeader";
import { SectionHeader } from "../../ui/primitives/SectionHeader";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { Chip } from "../../ui/primitives/Chip";

const PRESET_ROLES = [
  "Full Stack Engineer",
  "Frontend Developer",
  "Backend Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "System Architect"
];

const PRESET_TOPICS = [
  "React & Web Fundamentals",
  "Node.js & Express",
  "System Design",
  "Python & Data Structures",
  "SQL & Databases",
  "REST & GraphQL APIs"
];

const createInterviewSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  jobRole: z
    .string()
    .min(2, "Job role must be at least 2 characters")
    .max(100, "Job role cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  experienceLevel: z.enum(["Fresher", "1-2 Years", "3-5 Years", "5+ Years"]),
  duration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(120, "Duration cannot exceed 120 minutes"),
  instructions: z
    .string()
    .max(1000, "Instructions cannot exceed 1000 characters")
    .optional(),
});

const CreateInterviewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState("");

  // Candidate invitations state
  const [candidateEmails, setCandidateEmails] = useState([]);
  const [candidateMode, setCandidateMode] = useState("single"); // 'single' | 'bulk' | 'csv'
  const [singleEmailInput, setSingleEmailInput] = useState("");
  const [bulkEmailInput, setBulkEmailInput] = useState("");
  const [csvFileName, setCsvFileName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createInterviewSchema),
    defaultValues: {
      experienceLevel: "Fresher",
      duration: 30,
    },
  });

  const selectedRole = watch("jobRole");

  const addTopic = (topicToAdd) => {
    const trimmed = (topicToAdd || topicInput).trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
      if (!topicToAdd) setTopicInput("");
    }
  };

  const removeTopic = (topicToRemove) => {
    setTopics(topics.filter((t) => t !== topicToRemove));
  };

  const handleTopicKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTopic();
    }
  };

  // Candidate invitation handlers
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addSingleCandidate = () => {
    const trimmed = singleEmailInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      return toast.error("Please enter a valid candidate email address.");
    }
    if (candidateEmails.includes(trimmed)) {
      return toast.error("This email address has already been added.");
    }
    setCandidateEmails([...candidateEmails, trimmed]);
    setSingleEmailInput("");
    toast.success(`Added ${trimmed}`);
  };

  const addBulkCandidates = () => {
    const matches = bulkEmailInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    if (matches.length === 0) {
      return toast.error("No valid email addresses found in the text.");
    }
    const newEmails = [];
    matches.forEach((m) => {
      const email = m.toLowerCase();
      if (!candidateEmails.includes(email) && !newEmails.includes(email)) {
        newEmails.push(email);
      }
    });

    if (newEmails.length === 0) {
      return toast.error("All found emails are already added.");
    }

    setCandidateEmails([...candidateEmails, ...newEmails]);
    setBulkEmailInput("");
    toast.success(`Added ${newEmails.length} unique candidate email(s).`);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result || "";
      const matches = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      if (matches.length === 0) {
        toast.error("No valid email addresses found in file.");
        return;
      }
      const newEmails = [];
      matches.forEach((m) => {
        const email = m.toLowerCase();
        if (!candidateEmails.includes(email) && !newEmails.includes(email)) {
          newEmails.push(email);
        }
      });

      if (newEmails.length === 0) {
        toast.error("All emails in the file are already in your candidate list.");
        return;
      }

      setCandidateEmails((prev) => [...prev, ...newEmails]);
      toast.success(`Extracted & added ${newEmails.length} candidate email(s) from ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const removeCandidate = (emailToRemove) => {
    setCandidateEmails(candidateEmails.filter((e) => e !== emailToRemove));
  };

  const clearAllCandidates = () => {
    setCandidateEmails([]);
    setCsvFileName("");
  };

  const onSubmit = async (formData) => {
    if (!user?.isVerified) {
      toast.error("Your employer account is not verified. Only verified employers can create campaigns.");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post("/interviews", {
        ...formData,
        topics,
        candidateEmails,
      });
      if (data.success) {
        toast.success("Campaign created successfully!");
        navigate("/employer/dashboard");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to create campaign. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "flex w-full rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/30 px-4 py-3 text-sm font-bold text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-md3)]/50 focus:border-[var(--color-primary-md3)] transition-all duration-300";

  return (
    <div className="min-h-screen bg-transparent pt-6 pb-24 font-['Inter'] text-[var(--color-on-surface,#dae2fd)]">
      <div className="max-w-[900px] mx-auto px-4 md:px-6 space-y-8">

        {/* Back Link */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary-md3)] transition-colors text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </motion.div>

        {/* Page Header */}
        <PageHeader
          badgeIcon={Sparkles}
          badgeText="Campaign Creator"
          title="Create Interview Campaign"
          description="Configure candidate requirements, preset technical topics, invited candidate list, and AI evaluation criteria."
        />

        {/* Account Verification Warning Banner */}
        {!user?.isVerified && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-amber-300">
                  Account Verification Required
                </h4>
                <p className="text-xs text-amber-200/80 mt-1 font-medium leading-relaxed">
                  Your employer account is currently unverified. You can configure campaign details below, but publishing requires admin verification.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/employer/verification-pending")}
              className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl border border-amber-500/40 transition-all shrink-0 whitespace-nowrap"
            >
              Check Status & Support
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard padding="p-6 md:p-8" glowEffect>
              <SectionHeader
                icon={Briefcase}
                title="Campaign Essentials"
                subtitle="Specify target job role, campaign title, and description."
              />

              <div className="space-y-6">
                {/* Preset Role Quick Select */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2 block">
                    Quick Preset Roles
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PRESET_ROLES.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        selected={selectedRole === role}
                        onClick={() => setValue("jobRole", role, { shouldValidate: true })}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                      <FileText className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Campaign Title
                    </label>
                    <input
                      {...register("title")}
                      placeholder="e.g., Q3 Senior React Developer"
                      className={inputClasses}
                    />
                    {errors.title && (
                      <p className="mt-2 text-xs font-bold text-rose-400">
                        • {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                      <Briefcase className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Job Role
                    </label>
                    <input
                      {...register("jobRole")}
                      placeholder="e.g., Frontend Developer"
                      className={inputClasses}
                    />
                    {errors.jobRole && (
                      <p className="mt-2 text-xs font-bold text-rose-400">
                        • {errors.jobRole.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                    <AlignLeft className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                    Description <span className="text-[var(--color-on-surface-variant)]/50">(optional)</span>
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className={`${inputClasses} resize-none`}
                    placeholder="Brief description of this interview campaign..."
                  />
                  {errors.description && (
                    <p className="mt-2 text-xs font-bold text-rose-400">
                      • {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Technical Topics Section */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                    <Tag className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                    Technical Topics
                  </label>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PRESET_TOPICS.map((preset) => (
                      <Chip
                        key={preset}
                        label={preset}
                        selected={topics.includes(preset)}
                        onClick={() => {
                          if (topics.includes(preset)) removeTopic(preset);
                          else addTopic(preset);
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={handleTopicKeyDown}
                      placeholder="Add custom topic (e.g. Docker, GraphQL)"
                      className={inputClasses}
                    />
                    <button
                      type="button"
                      onClick={() => addTopic()}
                      className="px-5 py-2.5 bg-[var(--color-primary-md3)]/15 text-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)] hover:text-white border border-[var(--color-primary-md3)]/25 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Add
                    </button>
                  </div>

                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic) => (
                        <Chip
                          key={topic}
                          label={topic}
                          selected
                          onRemove={() => removeTopic(topic)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Experience Level
                    </label>
                    <select
                      {...register("experienceLevel")}
                      className={`${inputClasses} cursor-pointer appearance-none`}
                    >
                      <option value="Fresher" className="bg-[var(--color-surface-container-low)]">Fresher</option>
                      <option value="1-2 Years" className="bg-[var(--color-surface-container-low)]">1-2 Years</option>
                      <option value="3-5 Years" className="bg-[var(--color-surface-container-low)]">3-5 Years</option>
                      <option value="5+ Years" className="bg-[var(--color-surface-container-low)]">5+ Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-2">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      {...register("duration")}
                      min={5}
                      max={120}
                      className={inputClasses}
                    />
                    {errors.duration && (
                      <p className="mt-2 text-xs font-bold text-rose-400">
                        • {errors.duration.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Candidate Invitations Section (Single, Bulk, CSV) */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
            <GlassCard padding="p-6 md:p-8">
              <SectionHeader
                icon={UserPlus}
                title="Candidate Invitations (Optional)"
                subtitle="Assign candidates to this campaign using Single Email, Bulk Paste, or CSV File Upload."
              />

              <div className="space-y-6">
                {/* Entry Mode Selector Tabs */}
                <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-[var(--color-surface-container-highest)]/40 border border-[var(--color-outline-variant)]/30">
                  <button
                    type="button"
                    onClick={() => setCandidateMode("single")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                      candidateMode === "single"
                        ? "bg-[var(--color-primary-md3)] text-white shadow-md shadow-[var(--color-primary-md3)]/20"
                        : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Single Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidateMode("bulk")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                      candidateMode === "bulk"
                        ? "bg-[var(--color-primary-md3)] text-white shadow-md shadow-[var(--color-primary-md3)]/20"
                        : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" /> Multiple / Bulk
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidateMode("csv")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                      candidateMode === "csv"
                        ? "bg-[var(--color-primary-md3)] text-white shadow-md shadow-[var(--color-primary-md3)]/20"
                        : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> CSV / TXT Upload
                  </button>
                </div>

                {/* Mode 1: Single Email */}
                {candidateMode === "single" && (
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={singleEmailInput}
                      onChange={(e) => setSingleEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSingleCandidate();
                        }
                      }}
                      placeholder="candidate@company.com"
                      className={inputClasses}
                    />
                    <button
                      type="button"
                      onClick={addSingleCandidate}
                      className="px-5 py-2.5 bg-[var(--color-primary-md3)]/15 text-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)] hover:text-white border border-[var(--color-primary-md3)]/25 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Add Candidate
                    </button>
                  </div>
                )}

                {/* Mode 2: Bulk Text */}
                {candidateMode === "bulk" && (
                  <div className="space-y-3">
                    <textarea
                      value={bulkEmailInput}
                      onChange={(e) => setBulkEmailInput(e.target.value)}
                      rows={3}
                      placeholder="Paste candidate emails separated by commas, spaces, or newlines (e.g. john@acme.com, sarah@acme.com)..."
                      className={`${inputClasses} resize-none`}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={addBulkCandidates}
                        className="px-5 py-2.5 bg-[var(--color-primary-md3)]/15 text-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)] hover:text-white border border-[var(--color-primary-md3)]/25 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1.5" /> Add Bulk Emails
                      </button>
                    </div>
                  </div>
                )}

                {/* Mode 3: CSV Upload */}
                {candidateMode === "csv" && (
                  <div className="p-6 border-2 border-dashed border-[var(--color-outline-variant)]/40 rounded-2xl bg-[var(--color-surface-container-highest)]/20 text-center space-y-3 relative hover:border-[var(--color-primary-md3)]/50 transition-colors">
                    <input
                      type="file"
                      accept=".csv, .txt"
                      onChange={handleCsvUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary-md3)]/15 text-[var(--color-primary-md3)] flex items-center justify-center mx-auto border border-[var(--color-primary-md3)]/30">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-on-surface)]">
                        Drop CSV or TXT file here or click to browse
                      </h4>
                      <p className="text-[11px] text-[var(--color-on-surface-variant)] mt-1 font-medium">
                        Supports CSV files containing candidate emails in any column.
                      </p>
                    </div>
                    {csvFileName && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        <FileSpreadsheet className="w-3.5 h-3.5" /> Last Uploaded: {csvFileName}
                      </div>
                    )}
                  </div>
                )}

                {/* Candidate Emails List Preview */}
                {candidateEmails.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-[var(--color-outline-variant)]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                        Invited Candidates ({candidateEmails.length})
                      </span>
                      <button
                        type="button"
                        onClick={clearAllCandidates}
                        className="text-[10px] font-black uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Clear All
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 rounded-xl bg-[var(--color-surface-container-highest)]/20 border border-[var(--color-outline-variant)]/20">
                      {candidateEmails.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-surface-variant)]/60 border border-[var(--color-outline-variant)]/30 text-xs font-semibold text-[var(--color-on-surface)]"
                        >
                          <Mail className="w-3 h-3 text-[var(--color-primary-md3)] shrink-0" />
                          {email}
                          <button
                            type="button"
                            onClick={() => removeCandidate(email)}
                            className="hover:text-rose-400 transition-colors ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <GlassCard padding="p-6 md:p-8">
              <SectionHeader
                icon={Sparkles}
                title="AI System Instructions"
                subtitle="Provide custom prompt focus areas for the AI interviewer engine."
              />

              <div>
                <textarea
                  {...register("instructions")}
                  rows={4}
                  className={`${inputClasses} resize-none`}
                  placeholder="Provide specific guidelines for the InterviewOS (e.g., 'Focus heavily on React performance optimization and custom hooks...')"
                />
                {errors.instructions && (
                  <p className="mt-2 text-xs font-bold text-rose-400">
                    • {errors.instructions.message}
                  </p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3.5 bg-transparent hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !user?.isVerified}
                className={`px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center min-w-[200px] ${
                  !user?.isVerified
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-not-allowed"
                    : "bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 text-white shadow-lg shadow-[var(--color-primary-md3)]/25"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : !user?.isVerified ? (
                  <>
                    <ShieldAlert className="w-4 h-4 mr-2 text-amber-400" />
                    Verification Required
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Campaign
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateInterviewPage;
