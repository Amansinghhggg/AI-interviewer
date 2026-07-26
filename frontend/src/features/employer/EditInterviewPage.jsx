import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Users,
  Briefcase,
  Save,
  Edit
} from "lucide-react";
import { Button } from "../../ui/components/Button";
import { Card, CardContent } from "../../ui/components/Card";
import { Input } from "../../ui/components/Input";
import { Badge } from "../../ui/components/Badge";
import { motion } from "framer-motion";

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
    .min(1, "Duration must be at least 1 minute")
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
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-12">
      <div className="max-w-[800px] mx-auto px-6">
        
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-warning)]/10 text-[var(--color-warning)] flex items-center justify-center">
              <Edit className="w-5 h-5" />
            </div>
            Edit Campaign
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 text-lg">
            Update campaign details and invite more candidates.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-6 md:p-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                      <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                      Campaign Title
                    </label>
                    <Input
                      {...register("title")}
                      className="w-full"
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-[var(--color-danger)] flex items-center gap-1">
                        <span>•</span> {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                      <Briefcase className="w-4 h-4 text-[var(--text-secondary)]" />
                      Job Role
                    </label>
                    <Input
                      {...register("jobRole")}
                      className="w-full"
                    />
                    {errors.jobRole && (
                      <p className="mt-2 text-sm text-[var(--color-danger)] flex items-center gap-1">
                        <span>•</span> {errors.jobRole.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                    <AlignLeft className="w-4 h-4 text-[var(--text-secondary)]" />
                    Description <span className="text-[var(--text-secondary)] font-normal text-xs">(optional)</span>
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="flex w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200 resize-none"
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-[var(--color-danger)] flex items-center gap-1">
                      <span>•</span> {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                    <Tag className="w-4 h-4 text-[var(--text-secondary)]" />
                    Technical Topics
                  </label>
                  <div className="flex gap-3 mb-3">
                    <Input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={handleTopicKeyDown}
                      placeholder="e.g., React, System Design"
                      className="flex-1"
                    />
                    <Button type="button" variant="secondary" onClick={addTopic}>
                      <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                  </div>
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="pl-3 pr-2 py-1.5 flex items-center gap-1 text-sm">
                          {topic}
                          <button
                            type="button"
                            onClick={() => removeTopic(topic)}
                            className="text-[var(--text-secondary)] hover:text-[var(--color-danger)] transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                      <BookOpen className="w-4 h-4 text-[var(--text-secondary)]" />
                      Experience Level
                    </label>
                    <select
                      {...register("experienceLevel")}
                      className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all cursor-pointer"
                    >
                      <option value="Fresher">Fresher</option>
                      <option value="1-2 Years">1-2 Years</option>
                      <option value="3-5 Years">3-5 Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                      <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
                      Duration (Minutes)
                    </label>
                    <Input
                      type="number"
                      {...register("duration")}
                      min={5}
                      max={120}
                    />
                    {errors.duration && (
                      <p className="mt-2 text-sm text-[var(--color-danger)] flex items-center gap-1">
                        <span>•</span> {errors.duration.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-1">
                    <Users className="w-4 h-4 text-[var(--color-info)]" />
                    Invite New Candidates
                  </label>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    {existingCandidates.length} candidate(s) already assigned. Enter emails to assign more.
                  </p>
                  
                  <div className="flex gap-3 mb-4">
                    <Input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={handleEmailKeyDown}
                      placeholder="new.candidate@example.com"
                      className="flex-1"
                    />
                    <Button type="button" variant="secondary" onClick={addEmail}>
                      <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                  </div>
                  
                  {newEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 border border-[var(--border)] rounded-md bg-[var(--background-secondary)]/50 min-h-[60px]">
                      {newEmails.map((email) => (
                        <Badge key={email} variant="outline" className="pl-3 pr-2 py-1.5 flex items-center gap-2 bg-[var(--background)]">
                          {email}
                          <button
                            type="button"
                            onClick={() => removeNewEmail(email)}
                            className="text-[var(--text-secondary)] hover:text-[var(--color-danger)] transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-2">
                    <AlignLeft className="w-4 h-4 text-[var(--text-secondary)]" />
                    AI System Instructions <span className="text-[var(--text-secondary)] font-normal text-xs">(optional)</span>
                  </label>
                  <textarea
                    {...register("instructions")}
                    rows={4}
                    className="flex w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-200 resize-none"
                  />
                  {errors.instructions && (
                    <p className="mt-2 text-sm text-[var(--color-danger)] flex items-center gap-1">
                      <span>•</span> {errors.instructions.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="w-48 shadow-lg shadow-[var(--primary)]/20">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default EditInterviewPage;
