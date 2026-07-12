import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Clock,
  Hash,
  Tag,
  AlignLeft,
  BookOpen,
  Plus,
  X,
  Sparkles,
  Users,
  Briefcase,
  Save,
  Edit
} from "lucide-react";

const updateInterviewSchema = z.object({
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
    .min(5, "Duration must be at least 5 minutes")
    .max(120, "Duration cannot exceed 120 minutes"),
  instructions: z
    .string()
    .max(1000, "Instructions cannot exceed 1000 characters")
    .optional(),
});

const EditInterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState("");
  const [newEmails, setNewEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [existingCandidates, setExistingCandidates] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateInterviewSchema),
  });

  const fetchInterview = async () => {
    try {
      const { data } = await api.get(`/interviews/${id}`);
      if (data.success) {
        const interview = data.interview;
        reset({
          title: interview.title,
          jobRole: interview.jobRole,
          description: interview.description || "",
          experienceLevel: interview.experienceLevel || "Fresher",
          duration: interview.duration,
          instructions: interview.instructions || "",
        });
        setTopics(interview.topics || []);
        setExistingCandidates(interview.assignedCandidates || []);
      }
    } catch (error) {
      toast.error("Failed to load interview details");
      navigate("/employer/dashboard");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [id]);

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
    
    const isAlreadyAssigned = existingCandidates.some(c => c.email === trimmed);
    const isAlreadyAdded = newEmails.includes(trimmed);

    if (isAlreadyAssigned) {
      toast.error("Candidate is already assigned to this interview");
      return;
    }

    if (trimmed && emailRegex.test(trimmed) && !isAlreadyAdded) {
      setNewEmails([...newEmails, trimmed]);
      setEmailInput("");
    } else if (trimmed && !emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address");
    }
  };

  const removeNewEmail = (emailToRemove) => {
    setNewEmails(newEmails.filter((e) => e !== emailToRemove));
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        topics,
      };
      
      if (newEmails.length > 0) {
        payload.candidateEmails = newEmails;
      }

      const { data } = await api.patch(`/interviews/${id}`, payload);
      if (data.success) {
        toast.success("Interview updated successfully!");
        navigate("/employer/dashboard");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update interview. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/employer/dashboard")}
          className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-200 transition-colors mb-6 animate-fade-in-up"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50 flex items-center gap-3">
            <Edit className="w-7 h-7 text-warning-400" />
            Edit Interview
          </h1>
          <p className="text-dark-400 mt-2">
            Update interview details and add new candidates.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in-up-delay-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-light rounded-2xl p-6">
              <label htmlFor="interview-title" className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
                <FileText className="w-4 h-4 text-primary-400" />
                Interview Title
              </label>
              <input
                id="interview-title"
                type="text"
                {...register("title")}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
              />
              {errors.title && <p className="mt-1.5 text-sm text-danger-400">{errors.title.message}</p>}
            </div>

            <div className="glass-light rounded-2xl p-6">
              <label htmlFor="interview-jobrole" className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
                <Briefcase className="w-4 h-4 text-primary-400" />
                Job Role
              </label>
              <input
                id="interview-jobrole"
                type="text"
                {...register("jobRole")}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
              />
              {errors.jobRole && <p className="mt-1.5 text-sm text-danger-400">{errors.jobRole.message}</p>}
            </div>
          </div>

          <div className="glass-light rounded-2xl p-6">
            <label htmlFor="interview-description" className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
              <AlignLeft className="w-4 h-4 text-primary-400" />
              Description <span className="text-dark-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="interview-description"
              {...register("description")}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all resize-none"
            />
          </div>

          <div className="glass-light rounded-2xl p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
              <Tag className="w-4 h-4 text-primary-400" />
              Topics
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleTopicKeyDown}
                className="flex-1 px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
              />
              <button
                type="button"
                onClick={addTopic}
                className="px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-dark-300 hover:text-white hover:bg-dark-600 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span key={topic} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-sm border border-primary-500/20">
                    {topic}
                    <button type="button" onClick={() => removeTopic(topic)} className="hover:text-danger-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-light rounded-2xl p-6">
              <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
                <BookOpen className="w-4 h-4 text-primary-400" />
                Experience Level
              </label>
              <select {...register("experienceLevel")} className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all appearance-none cursor-pointer">
                <option value="Fresher">Fresher</option>
                <option value="1-2 Years">1-2 Years</option>
                <option value="3-5 Years">3-5 Years</option>
                <option value="5+ Years">5+ Years</option>
              </select>
            </div>
            <div className="glass-light rounded-2xl p-6">
              <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
                <Clock className="w-4 h-4 text-primary-400" />
                Duration (min)
              </label>
              <input type="number" {...register("duration")} className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all" min={5} max={120} />
            </div>

          </div>

          <div className="glass-light rounded-2xl p-6 border-l-4 border-l-info-500">
            <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
              <Users className="w-4 h-4 text-info-400" />
              Add More Candidates
            </label>
            <p className="text-xs text-dark-400 mb-3">
              {existingCandidates.length} candidate(s) already assigned. Enter emails to assign more.
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                className="flex-1 px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-info-500 focus:ring-1 focus:ring-info-500/50 transition-all"
                placeholder="new.candidate@example.com"
              />
              <button
                type="button"
                onClick={addEmail}
                className="px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-dark-300 hover:text-white hover:bg-dark-600 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {newEmails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newEmails.map((email) => (
                  <span key={email} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-info-500/20 text-info-300 text-sm border border-info-500/30">
                    {email}
                    <button type="button" onClick={() => removeNewEmail(email)} className="hover:text-danger-400 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="glass-light rounded-2xl p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
              <AlignLeft className="w-4 h-4 text-primary-400" />
              Instructions for Candidates
            </label>
            <textarea {...register("instructions")} rows={3} className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/employer/dashboard")}
              className="px-6 py-3 rounded-xl border border-dark-600 text-dark-300 hover:text-white hover:bg-dark-700 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-warning-600 to-warning-500 text-white font-semibold hover:from-warning-500 hover:to-warning-400 transition-all duration-300 shadow-lg shadow-warning-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-5 h-5" /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInterviewPage;
