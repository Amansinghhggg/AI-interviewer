import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

const createInterviewSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  duration: z.coerce
    .number()
    .min(5, "Duration must be at least 5 minutes")
    .max(120, "Duration cannot exceed 120 minutes"),
  numberOfQuestions: z.coerce
    .number()
    .min(1, "Must have at least 1 question")
    .max(50, "Cannot exceed 50 questions"),
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
      difficulty: "medium",
      duration: 30,
      numberOfQuestions: 10,
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
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/employer/dashboard")}
          className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-200 transition-colors mb-6 animate-fade-in-up"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-primary-400" />
            Create Interview
          </h1>
          <p className="text-dark-400 mt-2">
            Set up a new AI-powered interview for your candidates.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 animate-fade-in-up-delay-1"
        >
          {/* Title */}
          <div className="glass-light rounded-2xl p-6">
            <label
              htmlFor="interview-title"
              className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2"
            >
              <FileText className="w-4 h-4 text-primary-400" />
              Interview Title
            </label>
            <input
              id="interview-title"
              type="text"
              {...register("title")}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
              placeholder="e.g., Senior React Developer Interview"
            />
            {errors.title && (
              <p className="mt-1.5 text-sm text-danger-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="glass-light rounded-2xl p-6">
            <label
              htmlFor="interview-description"
              className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2"
            >
              <AlignLeft className="w-4 h-4 text-primary-400" />
              Description
              <span className="text-dark-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="interview-description"
              {...register("description")}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all resize-none"
              placeholder="Brief description of the interview..."
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-danger-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Topics */}
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
                placeholder="e.g., React, Node.js, System Design"
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
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-sm border border-primary-500/20"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="hover:text-danger-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Difficulty */}
            <div className="glass-light rounded-2xl p-6">
              <label
                htmlFor="interview-difficulty"
                className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2"
              >
                <BookOpen className="w-4 h-4 text-primary-400" />
                Difficulty
              </label>
              <select
                id="interview-difficulty"
                {...register("difficulty")}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Duration */}
            <div className="glass-light rounded-2xl p-6">
              <label
                htmlFor="interview-duration"
                className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2"
              >
                <Clock className="w-4 h-4 text-primary-400" />
                Duration (min)
              </label>
              <input
                id="interview-duration"
                type="number"
                {...register("duration")}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
                min={5}
                max={120}
              />
              {errors.duration && (
                <p className="mt-1.5 text-sm text-danger-400">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {/* Number of Questions */}
            <div className="glass-light rounded-2xl p-6">
              <label
                htmlFor="interview-questions"
                className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2"
              >
                <Hash className="w-4 h-4 text-primary-400" />
                Questions
              </label>
              <input
                id="interview-questions"
                type="number"
                {...register("numberOfQuestions")}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
                min={1}
                max={50}
              />
              {errors.numberOfQuestions && (
                <p className="mt-1.5 text-sm text-danger-400">
                  {errors.numberOfQuestions.message}
                </p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="glass-light rounded-2xl p-6">
            <label
              htmlFor="interview-instructions"
              className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2"
            >
              <AlignLeft className="w-4 h-4 text-primary-400" />
              Instructions for Candidates
              <span className="text-dark-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="interview-instructions"
              {...register("instructions")}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all resize-none"
              placeholder="Any specific instructions for candidates taking this interview..."
            />
            {errors.instructions && (
              <p className="mt-1.5 text-sm text-danger-400">
                {errors.instructions.message}
              </p>
            )}
          </div>

          {/* Submit */}
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
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
