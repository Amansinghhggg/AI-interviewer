import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  BrainCircuit,
  User,
  Building2,
  UserRound,
  ArrowRight
} from "lucide-react";

const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["employer", "candidate"], {
      required_error: "Please select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "candidate",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const data = await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.role
      );
      toast.success("Account created successfully!");
      if (data.user.role === "employer") {
        navigate("/employer/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--color-bg-base)] py-12">
      {/* Background noise and decorative gradients */}
      <div className="absolute inset-0 noise pointer-events-none"></div>
      <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-accent-teal)] rounded-full blur-[120px] opacity-10 animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-accent-blue)] rounded-full blur-[120px] opacity-20 animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-[1000px] mx-4 z-10 grid md:grid-cols-2 gap-8 items-center animate-fade-in-up">
        
        {/* Left side: Branding / Copy */}
        <div className="hidden md:flex flex-col pr-8 lg:pr-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center shadow-lg">
              <BrainCircuit className="w-7 h-7 text-[var(--color-accent-violet)]" />
            </div>
            <span className="text-3xl font-bold text-white tracking-wide">
              Intervu
            </span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Unlock your <br/>
            <span className="gradient-text">full potential.</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-8">
            Join the platform built for modern hiring. Find the best talent or practice your interviewing skills with our advanced AI engine.
          </p>
          
          <div className="flex flex-col gap-4 mt-auto">
             <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-accent-teal)]">✓</div>
                <span>Create highly tailored AI interviews</span>
             </div>
             <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-accent-teal)]">✓</div>
                <span>Get real-time AI scoring & insights</span>
             </div>
             <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-accent-teal)]">✓</div>
                <span>Practice and improve continuously</span>
             </div>
          </div>
        </div>

        {/* Right side: Signup Card */}
        <div className="surface-elevated p-8 md:p-10 relative overflow-hidden">
          {/* Subtle top border glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent-teal)] to-[var(--color-accent-blue)]"></div>

          <div className="text-center mb-8 md:hidden">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-[var(--color-accent-violet)]" />
              </div>
              <span className="text-2xl font-bold text-white">Intervu</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Create an account</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">Start hiring smarter or showcase your skills</p>
          </div>

          <div className="hidden md:block mb-8">
            <h2 className="text-2xl font-bold text-white">Create an account</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">Start hiring smarter or showcase your skills</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor="role-employer"
                  className={`relative flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${selectedRole === "employer"
                      ? "border-[var(--color-accent-blue)] bg-[var(--color-accent-blue-glow)] text-[var(--color-accent-blue)]"
                      : "border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-border-active)] hover:text-[var(--color-text-primary)]"
                    }`}
                >
                  <input
                    id="role-employer"
                    type="radio"
                    value="employer"
                    {...register("role")}
                    className="sr-only"
                  />
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">Employer</span>
                </label>
                <label
                  htmlFor="role-candidate"
                  className={`relative flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${selectedRole === "candidate"
                      ? "border-[var(--color-accent-teal)] bg-[rgba(45,212,191,0.15)] text-[var(--color-accent-teal)]"
                      : "border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-border-active)] hover:text-[var(--color-text-primary)]"
                    }`}
                >
                  <input
                    id="role-candidate"
                    type="radio"
                    value="candidate"
                    {...register("role")}
                    className="sr-only"
                  />
                  <UserRound className="w-5 h-5" />
                  <span className="font-medium">Candidate</span>
                </label>
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-[var(--color-accent-red)] flex items-center gap-1">
                  <span>•</span> {errors.role.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent-blue)] transition-colors" />
                <input
                  id="signup-name"
                  type="text"
                  {...register("name")}
                  className="input-field pl-11"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-[var(--color-accent-red)] flex items-center gap-1">
                  <span>•</span> {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent-blue)] transition-colors" />
                <input
                  id="signup-email"
                  type="email"
                  {...register("email")}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-[var(--color-accent-red)] flex items-center gap-1">
                  <span>•</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent-blue)] transition-colors" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="input-field pl-11 pr-12"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-[var(--color-accent-red)] flex items-center gap-1">
                  <span>•</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent-blue)] transition-colors" />
                <input
                  id="signup-confirm-password"
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="input-field pl-11 pr-4"
                  placeholder="Re-enter password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-[var(--color-accent-red)] flex items-center gap-1">
                  <span>•</span> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 mt-4 flex items-center justify-center gap-2 group text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-8 text-center border-t border-[var(--color-border-subtle)] pt-6">
            <p className="text-[var(--color-text-secondary)]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[var(--color-accent-blue)] hover:text-white transition-colors font-medium ml-1"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
