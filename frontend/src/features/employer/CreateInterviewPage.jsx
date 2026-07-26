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
  X,
  Sparkles,
  Users,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";

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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createInterviewSchema),
    defaultValues: {
      experienceLevel: "Fresher",
      duration: 30,
    },
  });

  const addTopic = () => {
    const trimmed = topicInput.trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
      setTopicInput("");
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
    <div className="min-h-screen bg-[var(--color-background-md3,var(--background))] pt-12 pb-24 font-['Inter']">
      <div className="max-w-[800px] mx-auto px-4 md:px-6">

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary-md3)] transition-colors mb-8 text-[11px] font-black uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black text-[var(--color-on-surface)] flex items-center gap-4 tracking-tight uppercase">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] flex items-center justify-center border border-[var(--color-primary-md3)]/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
              <Sparkles className="w-6 h-6" />
            </div>
            Create Campaign
          </h1>
          <p className="text-[var(--color-on-surface-variant)] mt-3 text-sm font-bold uppercase tracking-widest">
            Set up an AI-driven interview campaign and invite candidates.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-md3)]/5 rounded-full blur-[60px] pointer-events-none"></div>

              <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-3">
                      <FileText className="w-4 h-4 text-[var(--color-primary-md3)]" />
                      Organization
                    </label>
                    <input
                      {...register("title")}
                      placeholder="e.g., Q3 Senior React Developer"
                      className={inputClasses}
                    />
                    {errors.title && (
                      <p className="mt-2 text-xs font-bold text-[var(--color-error)] flex items-center gap-1">
                        <span>•</span> {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-3">
                      <Briefcase className="w-4 h-4 text-[var(--color-primary-md3)]" />
                      Job Role
                    </label>
                    <input
                      {...register("jobRole")}
                      placeholder="e.g., Frontend Developer"
                      className={inputClasses}
                    />
                    {errors.jobRole && (
                      <p className="mt-2 text-xs font-bold text-[var(--color-error)] flex items-center gap-1">
                        <span>•</span> {errors.jobRole.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-3">
                    <AlignLeft className="w-4 h-4 text-[var(--color-primary-md3)]" />
                    Description <span className="text-[var(--color-on-surface-variant)]/50">(optional)</span>
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className={`${inputClasses} resize-none`}
                    placeholder="Brief description of this interview campaign..."
                  />
                  {errors.description && (
                    <p className="mt-2 text-xs font-bold text-[var(--color-error)] flex items-center gap-1">
                      <span>•</span> {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-3">
                    <Tag className="w-4 h-4 text-[var(--color-primary-md3)]" />
                    Technical Topics
                  </label>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={handleTopicKeyDown}
                      placeholder="e.g., React, System Design"
                      className={inputClasses}
                    />
                    <button type="button" onClick={addTopic} className="px-6 py-3 bg-[var(--color-surface-container-highest)] hover:bg-[var(--color-primary-md3)]/20 text-[var(--color-on-surface)] hover:text-[var(--color-primary-md3)] border border-[var(--color-outline-variant)]/30 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center shrink-0">
                      <Plus className="w-4 h-4 mr-2" /> Add
                    </button>
                  </div>
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic) => (
                        <div key={topic} className="px-3 py-1.5 bg-[var(--color-surface-variant)]/50 border border-[var(--color-outline-variant)]/30 rounded-lg flex items-center gap-2 text-xs font-bold text-[var(--color-on-surface)]">
                          {topic}
                          <button
                            type="button"
                            onClick={() => removeTopic(topic)}
                            className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-3">
                      <BookOpen className="w-4 h-4 text-[var(--color-primary-md3)]" />
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
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-3">
                      <Clock className="w-4 h-4 text-[var(--color-primary-md3)]" />
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
                      <p className="mt-2 text-xs font-bold text-[var(--color-error)] flex items-center gap-1">
                        <span>•</span> {errors.duration.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-secondary)]/5 rounded-full blur-[60px] pointer-events-none"></div>

              <div className="space-y-8 relative z-10">
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface)] mb-3">
                    <AlignLeft className="w-4 h-4 text-[var(--color-secondary)]" />
                    AI System Instructions <span className="text-[var(--color-on-surface-variant)]/50">(optional)</span>
                  </label>
                  <textarea
                    {...register("instructions")}
                    rows={4}
                    className={`${inputClasses} resize-none`}
                    placeholder="Provide specific guidelines for the AI Interviewer (e.g., 'Focus heavily on React performance optimization...')"
                  />
                  {errors.instructions && (
                    <p className="mt-2 text-xs font-bold text-[var(--color-error)] flex items-center gap-1">
                      <span>•</span> {errors.instructions.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-4 bg-transparent hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/30 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center min-w-[220px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
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
