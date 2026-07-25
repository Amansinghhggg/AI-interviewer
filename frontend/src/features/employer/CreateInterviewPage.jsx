import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../services/api";
import toast from "react-hot-toast";
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
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");

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

  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (trimmed && emailRegex.test(trimmed) && !emails.includes(trimmed)) {
      setEmails([...emails, trimmed]);
      setEmailInput("");
    } else if (trimmed && !emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address");
    }
  };

  const removeEmail = (emailToRemove) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const onSubmit = async (formData) => {
    if (emails.length === 0) {
      toast.error("Please add at least one candidate email");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post("/interviews", {
        ...formData,
        topics,
        candidateEmails: emails,
      });
      if (data.success) {
        toast.success("Interview created successfully!");
        navigate("/employer/dashboard");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create interview. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pt-24 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 noise pointer-events-none z-0"></div>
      
      {/* Decorative top blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[200px] bg-[var(--color-accent-blue)] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-on-surface)] transition-colors mb-6 animate-fade-in-up"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-[var(--color-on-surface)] flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-[var(--color-accent-violet)]" />
            </div>
            Create Interview
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-3 text-lg">
            Set up a new AI-powered interview for your candidates.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 animate-fade-in-up-delay-1"
        >
          {/* Title & Job Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="surface p-6">
              <label
                htmlFor="interview-title"
                className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-3"
              >
                <FileText className="w-4 h-4 text-[var(--color-accent-blue)]" />
                Interview Title
              </label>
              <input
                id="interview-title"
                type="text"
                {...register("title")}
                className="input-field w-full px-4 py-3"
                placeholder="e.g., Senior React Developer Interview"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-[var(--color-accent-red)] flex items-center gap-1">
                  <span>•</span> {errors.title.message}
                </p>
              )}
            </div>

            <div className="surface p-6">
              <label
                htmlFor="interview-jobrole"
                className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-3"
              >
                <Briefcase className="w-4 h-4 text-[var(--color-accent-blue)]" />
                Job Role
              </label>
              <input
                id="interview-jobrole"
                type="text"
                {...register("jobRole")}
                className="input-field w-full px-4 py-3"
                placeholder="e.g., Frontend Developer"
              />
              {errors.jobRole && (
                <p className="mt-2 text-sm text-[var(--color-accent-red)] flex items-center gap-1">
                  <span>•</span> {errors.jobRole.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="surface p-6">
            <label
              htmlFor="interview-description"
              className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-3"
            >
              <AlignLeft className="w-4 h-4 text-[var(--color-accent-blue)]" />
              Description
              <span className="text-[var(--color-text-muted)] font-normal ml-1">(optional)</span>
            </label>
            <textarea
              id="interview-description"
              {...register("description")}
              rows={3}
              className="input-field w-full px-4 py-3 resize-none"
              placeholder="Brief description of the interview..."
            />
            {errors.description && (
              <p className="mt-2 text-sm text-[var(--color-accent-red)] flex items-center gap-1">
                <span>•</span> {errors.description.message}
              </p>
            )}
          </div>

          {/* Topics */}
          <div className="surface p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-3">
              <Tag className="w-4 h-4 text-[var(--color-accent-blue)]" />
              Topics
            </label>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleTopicKeyDown}
                className="input-field flex-1 px-4 py-3"
                placeholder="e.g., React, Node.js, System Design"
              />
              <button
                type="button"
                onClick={addTopic}
                className="btn-secondary px-4 py-3"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(139,92,246,0.15)] text-[var(--color-accent-violet)] text-sm font-medium border border-[rgba(139,92,246,0.3)]"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="hover:text-[var(--color-accent-red)] transition-colors ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Experience Level */}
            <div className="surface p-6">
              <label
                htmlFor="interview-experienceLevel"
                className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-3"
              >
                <BookOpen className="w-4 h-4 text-[var(--color-accent-blue)]" />
                Experience Level
              </label>
              <select
                id="interview-experienceLevel"
                {...register("experienceLevel")}
                className="input-field w-full px-4 py-3 appearance-none cursor-pointer"
              >
                <option value="Fresher" className="bg-[var(--color-bg-elevated)]">Fresher</option>
                <option value="1-2 Years" className="bg-[var(--color-bg-elevated)]">1-2 Years</option>
                <option value="3-5 Years" className="bg-[var(--color-bg-elevated)]">3-5 Years</option>
                <option value="5+ Years" className="bg-[var(--color-bg-elevated)]">5+ Years</option>
              </select>
            </div>

            {/* Duration */}
            <div className="surface p-6">
              <label
                htmlFor="interview-duration"
                className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-3"
              >
                <Clock className="w-4 h-4 text-[var(--color-accent-blue)]" />
                Duration (min)
              </label>
              <input
                id="interview-duration"
                type="number"
                {...register("duration")}
                className="input-field w-full px-4 py-3"
                min={5}
                max={120}
              />
              {errors.duration && (
                <p className="mt-2 text-sm text-[var(--color-accent-red)] flex items-center gap-1">
                  <span>•</span> {errors.duration.message}
                </p>
              )}
            </div>
          </div>

          {/* Candidate Emails */}
          <div className="surface p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-accent-blue)] to-[var(--color-accent-violet)]"></div>
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-on-surface)] mb-2">
              <Users className="w-4 h-4 text-[var(--color-accent-blue)]" />
              Assign Candidates (Emails)
              <span className="text-[var(--color-accent-red)]">*</span>
            </label>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">Add candidate emails who should have access to this interview.</p>
            <div className="flex gap-3 mb-4">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                className="input-field flex-1 px-4 py-3"
                placeholder="candidate@example.com"
              />
              <button
                type="button"
                onClick={addEmail}
                className="btn-secondary px-4 py-3"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {emails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] text-sm font-medium border border-[var(--color-border-active)]"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="hover:text-[var(--color-accent-red)] transition-colors ml-1 text-[var(--color-text-muted)]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="surface p-6">
            <label
              htmlFor="interview-instructions"
              className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-3"
            >
              <AlignLeft className="w-4 h-4 text-[var(--color-accent-blue)]" />
              Instructions for Candidates
              <span className="text-[var(--color-text-muted)] font-normal ml-1">(optional)</span>
            </label>
            <textarea
              id="interview-instructions"
              {...register("instructions")}
              rows={3}
              className="input-field w-full px-4 py-3 resize-none"
              placeholder="Any specific instructions for candidates taking this interview..."
            />
            {errors.instructions && (
              <p className="mt-2 text-sm text-[var(--color-accent-red)] flex items-center gap-1">
                <span>•</span> {errors.instructions.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4 border-t border-[var(--color-border-subtle)] mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary py-3.5 px-6"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInterviewPage;
