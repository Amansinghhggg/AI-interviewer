import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { User, Lock, Trash2, Mail, Save, Loader2, Camera, FileText, ShieldCheck, ShieldAlert } from "lucide-react";
import ResumeCard from "./components/ResumeCard";
import UploadProgress from "./components/UploadProgress";
import profileService from "../../services/profile.service";

const ProfilePage = () => {
  const { user, login } = useAuth(); // login from context updates the user state

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [resume, setResume] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  // Fetch resume if candidate
  useEffect(() => {
    if (user?.role === "candidate") {
      profileService.getMyResume()
        .then(res => setResume(res.data))
        .catch(err => console.error("Failed to fetch resume:", err));
    }
  }, [user?.role]);

  const getInitials = (name) => {
    return name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "?";
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");

    setIsUpdatingName(true);
    try {
      const { data } = await api.put("/auth/profile", { name });
      if (data.success) {
        toast.success("Profile updated successfully");
        login(data.user); // update the context user
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill all password fields");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    setIsUpdatingPassword(true);
    try {
      const { data } = await api.put("/auth/password", { currentPassword, newPassword });
      if (data.success) {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    // Dummy button functionality
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.error("Account deletion is disabled in this demo environment.");
    }
  };

  const handleResumeReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be smaller than 5 MB");
      e.target.value = "";
      return;
    }

    setIsUploadingResume(true);
    setUploadProgress(0);

    // Simulate gradual progress up to 90%
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    const toastId = toast.loading("Uploading resume...");
    try {
      const response = await profileService.uploadResume(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setResume(response.data);
        toast.success("Resume updated successfully", { id: toastId });
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast.error(error.response?.data?.message || "Failed to upload resume", { id: toastId });
      setUploadProgress(null);
    } finally {
      setIsUploadingResume(false);
      e.target.value = "";
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent font-['Inter'] pb-24">
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-10 space-y-8">

        {/* User Profile Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-6 py-8 border-b border-[var(--color-outline-variant)]/30 mb-8"
        >
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-2 border-[var(--color-primary-md3)] p-1 bg-[var(--color-surface-container-lowest)] overflow-hidden">
              <div className="w-full h-full rounded-full bg-[var(--color-surface-container-high)] flex items-center justify-center text-[var(--color-primary-md3)] overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black uppercase">
                    {getInitials(user?.name)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-[var(--color-on-surface)] uppercase tracking-tight">{user?.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-1.5 flex-wrap">
              <span className="text-xs font-black text-[var(--color-primary-md3)] tracking-widest uppercase">{user?.role}</span>
              {user?.role === "employer" && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  user?.isVerified
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                }`}>
                  {user?.isVerified ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Verified Employer
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      Pending Verification
                    </>
                  )}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">Manage your professional identity and security settings.</p>
          </div>
        </motion.section>

        {/* General Information */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 p-6 rounded-2xl shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-[var(--color-primary-md3)]" />
            <h3 className="text-sm font-bold text-[var(--color-on-surface)] uppercase tracking-widest">General Information</h3>
          </div>

          <form onSubmit={handleUpdateName}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] px-1">Email Address</label>
                <div className="flex items-center gap-3 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 px-4 py-3 rounded-lg">
                  <Mail className="w-4 h-4 text-[var(--color-on-surface-variant)] shrink-0" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-transparent border-none focus:outline-none text-sm font-semibold text-[var(--color-on-surface-variant)] w-full cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-[var(--color-on-surface-variant)]/70 px-1 italic">Email address cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] px-1">Full Name</label>
                <div className="flex items-center gap-3 bg-[var(--color-surface-container-high)]/30 border border-[var(--color-outline-variant)]/50 px-4 py-3 rounded-lg focus-within:border-[var(--color-primary-md3)] transition-colors">
                  <User className="w-4 h-4 text-[var(--color-on-surface-variant)] shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-sm font-semibold text-[var(--color-on-surface)] w-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingName || name === user?.name}
                className="bg-[var(--color-primary-md3)] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-primary-md3)]/20"
              >
                {isUpdatingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </motion.section>

        {/* Security Section */}
        {user?.authProvider !== 'google' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 p-6 rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-[var(--color-primary-md3)]" />
              <h3 className="text-sm font-bold text-[var(--color-on-surface)] uppercase tracking-widest">Security</h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] px-1">Current Password</label>
                <div className="flex items-center gap-3 bg-[var(--color-surface-container-high)]/30 border border-[var(--color-outline-variant)]/50 px-4 py-3 rounded-lg focus-within:border-[var(--color-primary-md3)] transition-colors">
                  <Lock className="w-4 h-4 text-[var(--color-on-surface-variant)] shrink-0" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent border-none focus:outline-none text-sm font-semibold text-[var(--color-on-surface)] w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] px-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--color-surface-container-high)]/30 border border-[var(--color-outline-variant)]/50 px-4 py-3 rounded-lg text-sm font-semibold text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary-md3)] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] px-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--color-surface-container-high)]/30 border border-[var(--color-outline-variant)]/50 px-4 py-3 rounded-lg text-sm font-semibold text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary-md3)] transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/50 text-[var(--color-on-surface)] text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-[var(--color-surface-container-highest)] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Update Password
                </button>
              </div>
            </form>
          </motion.section>
        )}

        {/* Resume Section */}
        {user?.role === "candidate" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 p-6 rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-[var(--color-primary-md3)]" />
              <h3 className="text-sm font-bold text-[var(--color-on-surface)] uppercase tracking-widest">Resume & Documents</h3>
            </div>

            <ResumeCard
              resume={resume}
              readOnly={false}
              onReplace={() => document.getElementById("resume-upload").click()}
              onDownload={(filename) => profileService.downloadResume("/profile/resume/download", filename)}
              viewUrl="/api/profile/resume/download"
            />

            {uploadProgress !== null && (
              <UploadProgress progress={uploadProgress} fileName="Replacement Resume" />
            )}

            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              className="hidden"
              onChange={handleResumeReplace}
              disabled={isUploadingResume}
            />
          </motion.section>
        )}

        {/* Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-[var(--color-error)]/30 p-6 rounded-2xl bg-[var(--color-surface-container-lowest)] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-error)]/5 rounded-full blur-[40px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3 text-[var(--color-error)]">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Danger Zone</h3>
            </div>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
              Once you delete your account, there is no going back. All recruitment history, active applications, and interview data will be permanently erased.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-3 border border-[var(--color-error)]/50 text-[var(--color-error)] font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[var(--color-error)]/10 transition-all active:scale-95 flex items-center"
            >
              Delete Account
            </button>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default ProfilePage;
