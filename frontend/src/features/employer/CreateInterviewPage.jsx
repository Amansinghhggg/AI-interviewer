import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../services/api";
import { toast } from "react-hot-toast";
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
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState("");

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

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/interviews", {
        ...formData,
        topics,
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
          description="Configure candidate requirements, preset technical topics, and AI evaluation criteria."
        />

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
                  placeholder="Provide specific guidelines for the AI Interviewer (e.g., 'Focus heavily on React performance optimization and custom hooks...')"
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
                disabled={isLoading}
                className="px-8 py-3.5 bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-[var(--color-primary-md3)]/25 flex items-center justify-center min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
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
