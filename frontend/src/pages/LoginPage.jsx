import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  BrainCircuit,
  Building2,
  UserRound,
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
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-20">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-80 h-80 bg-primary-500/8 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent-500/8 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">AI Interview</span>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 glow-primary">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-dark-50 mb-2">
              Welcome back
            </h1>
            <p className="text-dark-400">
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="login-email"
                  type="email"
                  {...register("email")}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-danger-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-danger-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm text-dark-500 bg-dark-800/60">
                New to AI Interview?
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <Link
            to="/signup"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dark-600 text-dark-200 hover:text-white hover:bg-dark-700/50 transition-all duration-200 font-medium"
          >
            Create an account
          </Link>
        </div>

        {/* Role hint */}
        <div className="flex items-center justify-center gap-6 mt-6 text-dark-500 text-sm">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>Employer</span>
          </div>
          <span className="text-dark-700">|</span>
          <div className="flex items-center gap-1.5">
            <UserRound className="w-4 h-4" />
            <span>Candidate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
