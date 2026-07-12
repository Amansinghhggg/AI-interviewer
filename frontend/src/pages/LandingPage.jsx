import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BrainCircuit,
  Shield,
  BarChart3,
  Video,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const LandingPage = () => {
  const { user } = useAuth();

  const dashboardPath =
    user?.role === "employer"
      ? "/employer/dashboard"
      : "/candidate/dashboard";

  const features = [
    {
      icon: BrainCircuit,
      title: "AI-Powered Questions",
      description:
        "Adaptive interview questions that adjust difficulty based on candidate responses in real-time.",
      color: "from-primary-500 to-primary-400",
    },
    {
      icon: Video,
      title: "Video Recording",
      description:
        "Automatic webcam and audio recording with secure cloud storage for reviewing interviews later.",
      color: "from-accent-500 to-accent-400",
    },
    {
      icon: BarChart3,
      title: "Detailed Reports",
      description:
        "Comprehensive analytics including technical scores, communication feedback, and candidate recommendations.",
      color: "from-warning-500 to-warning-400",
    },
    {
      icon: Shield,
      title: "Anti-Cheating",
      description:
        "Advanced proctoring with tab-switching detection, face tracking, and behavioral analysis.",
      color: "from-danger-500 to-danger-400",
    },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px] animate-pulse-glow" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-dark-200">
              AI-Powered Interview Platform
            </span>
          </div>

          {/* Main heading */}
          <h1 className="animate-fade-in-up-delay-1 text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Smarter Interviews,
            <br />
            <span className="gradient-text">Better Hires</span>
          </h1>

          {/* Subheading */}
          <p className="animate-fade-in-up-delay-2 text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create AI-driven interviews that adapt to each candidate.
            Get detailed reports, recordings, and analytics — all in one
            platform.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to={dashboardPath}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-lg hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-lg hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass text-dark-100 font-semibold text-lg hover:text-white hover:bg-dark-700/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Hire Smarter</span>
            </h2>
            <p className="text-dark-300 text-lg max-w-2xl mx-auto">
              Our platform combines AI intelligence with powerful tools to
              transform your hiring process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group glass-light rounded-2xl p-8 hover:bg-dark-700/40 transition-all duration-500 hover:-translate-y-1 animate-fade-in-up-delay-${Math.min(index + 1, 3)}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-dark-50">
                  {feature.title}
                </h3>
                <p className="text-dark-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto glass rounded-2xl p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10x", label: "Faster Hiring" },
              { value: "95%", label: "Accuracy Rate" },
              { value: "24/7", label: "AI Available" },
              { value: "100%", label: "Secure" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </p>
                <p className="text-dark-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your{" "}
            <span className="gradient-text">Hiring Process</span>?
          </h2>
          <p className="text-dark-300 text-lg mb-8">
            Join forward-thinking companies using AI to find the best talent.
          </p>
          {!user && (
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold text-lg hover:from-primary-500 hover:to-accent-500 transition-all duration-300 shadow-xl shadow-primary-500/20 hover:-translate-y-0.5"
            >
              <Zap className="w-5 h-5" />
              Start Free Today
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-dark-700/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold gradient-text">
              AI Interview
            </span>
          </div>
          <p className="text-dark-500 text-sm">
            © {new Date().getFullYear()} AI Interview Platform. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
