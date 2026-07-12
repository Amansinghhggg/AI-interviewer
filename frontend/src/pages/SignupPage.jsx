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
  User,
  Building2,
  UserRound,
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
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-20">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-20 w-80 h-80 bg-accent-500/8 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary-500/8 rounded-full blur-[100px]" />

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
              Create your account
            </h1>
            <p className="text-dark-400">
              Start hiring smarter or showcase your skills
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor="role-employer"
                  className={`relative flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                    selectedRole === "employer"
                      ? "border-primary-500 bg-primary-500/10 text-primary-400"
                      : "border-dark-600 text-dark-400 hover:border-dark-500 hover:text-dark-300"
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
                  className={`relative flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                    selectedRole === "candidate"
                      ? "border-accent-500 bg-accent-500/10 text-accent-400"
                      : "border-dark-600 text-dark-400 hover:border-dark-500 hover:text-dark-300"
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
                <p className="mt-1.5 text-sm text-danger-400">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="signup-name"
                  type="text"
                  {...register("name")}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-sm text-danger-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="signup-email"
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
                htmlFor="signup-password"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
                  placeholder="At least 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-sm font-medium text-dark-200 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="signup-confirm-password"
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
                  placeholder="Re-enter password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-danger-400">
                  {errors.confirmPassword.message}
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
                  Creating account...
                </>
              ) : (
                "Create account"
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
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign in link */}
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dark-600 text-dark-200 hover:text-white hover:bg-dark-700/50 transition-all duration-200 font-medium"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
