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
  ArrowRight
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === "employer") {
        navigate("/employer/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--color-bg-base)]">
      {/* Background noise and decorative gradients */}
      <div className="absolute inset-0 noise"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-accent-violet)] rounded-full blur-[120px] opacity-20 animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-accent-blue)] rounded-full blur-[120px] opacity-20 animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>

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
            The future of <br/>
            <span className="gradient-text">hiring is here.</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-8">
            Sign in to your account to conduct AI-powered interviews, analyze candidate performance, or track your job applications.
          </p>
          
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mt-auto">
            <div className="flex items-center gap-2 bg-[var(--color-bg-surface)] px-3 py-1.5 rounded-full border border-[var(--color-border-subtle)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent-teal)]"></span>
              Secure Login
            </div>
            <div className="flex items-center gap-2 bg-[var(--color-bg-surface)] px-3 py-1.5 rounded-full border border-[var(--color-border-subtle)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent-blue)]"></span>
              Fast Access
            </div>
          </div>
        </div>

        {/* Right side: Login Card */}
        <div className="surface-elevated p-8 md:p-10 relative overflow-hidden">
          {/* Subtle top border glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-violet)]"></div>

          <div className="text-center mb-10 md:hidden">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-[var(--color-accent-violet)]" />
              </div>
              <span className="text-2xl font-bold text-white">Intervu</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">Sign in to access your dashboard</p>
          </div>

          <div className="hidden md:block mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent-blue)] transition-colors" />
                <input
                  id="login-email"
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
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent-blue)] transition-colors" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="input-field pl-11 pr-12"
                  placeholder="••••••••"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 group text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center border-t border-[var(--color-border-subtle)] pt-6">
            <p className="text-[var(--color-text-secondary)]">
              Don't have an account yet?{" "}
              <Link
                to="/signup"
                className="text-[var(--color-accent-blue)] hover:text-white transition-colors font-medium ml-1"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
