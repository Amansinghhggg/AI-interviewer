import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { User, Lock, Trash2, Mail, Save, Loader2, Camera } from "lucide-react";

const ProfilePage = () => {
  const { user, login } = useAuth(); // login from context updates the user state

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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

  return (
    <div className="w-full font-['Inter'] pb-24">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-[var(--color-on-surface)] mb-2 uppercase">
            Profile Settings
          </h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] uppercase tracking-widest font-bold">
            Manage your account details and preferences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Avatar Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-1 space-y-6">
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary-md3)]/10 rounded-full blur-[40px] pointer-events-none transition-all group-hover:bg-[var(--color-primary-md3)]/20" />
              
              <div className="relative z-10 mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-[var(--color-surface)] shadow-2xl overflow-hidden bg-[var(--color-primary-md3)]/10 flex items-center justify-center relative group/avatar cursor-pointer">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-[var(--color-primary-md3)] uppercase">
                      {getInitials(user?.name)}
                    </span>
                  )}
                  
                  {/* Hover Overlay for Picture Change (Dummy for now) */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                     <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-black text-[var(--color-on-surface)] uppercase">{user?.name}</h2>
              <p className="text-xs font-bold text-[var(--color-primary-md3)] uppercase tracking-widest mt-1 bg-[var(--color-primary-md3)]/10 px-3 py-1 rounded-full">{user?.role}</p>
            </div>
          </motion.div>

          {/* Settings Sections */}
          <div className="md:col-span-2 space-y-8">
            
            {/* General Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-[var(--color-primary-md3)]" />
                <h3 className="text-lg font-black tracking-tight text-[var(--color-on-surface)] uppercase">General Information</h3>
              </div>
              
              <form onSubmit={handleUpdateName} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] mb-2">Email Address</label>
                  <div className="flex items-center px-4 py-3 bg-[var(--color-surface-variant)]/30 border border-[var(--color-outline-variant)]/30 rounded-xl">
                    <Mail className="w-4 h-4 text-[var(--color-on-surface-variant)] mr-3" />
                    <input 
                      type="email" 
                      value={user?.email || ""} 
                      disabled 
                      className="bg-transparent border-none focus:outline-none text-sm font-bold text-[var(--color-on-surface-variant)] w-full cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--color-on-surface-variant)]/70 mt-2 font-semibold">Email address cannot be changed.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/50 rounded-xl text-sm font-bold text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-md3)]/50 focus:border-[var(--color-primary-md3)] transition-all"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={isUpdatingName || name === user?.name}
                    className="px-6 py-3 bg-[var(--color-primary-md3)] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-all flex items-center shadow-lg shadow-[var(--color-primary-md3)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingName ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Password Section */}
            {user?.authProvider !== 'google' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-5 h-5 text-[var(--color-primary-md3)]" />
                  <h3 className="text-lg font-black tracking-tight text-[var(--color-on-surface)] uppercase">Security</h3>
                </div>
                
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] mb-2">Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/50 rounded-xl text-sm font-bold text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-md3)]/50 focus:border-[var(--color-primary-md3)] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] mb-2">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/50 rounded-xl text-sm font-bold text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-md3)]/50 focus:border-[var(--color-primary-md3)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/50 rounded-xl text-sm font-bold text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-md3)]/50 focus:border-[var(--color-primary-md3)] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="px-6 py-3 bg-[var(--color-primary-md3)] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-all flex items-center shadow-lg shadow-[var(--color-primary-md3)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Update Password
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Danger Zone */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[var(--color-error)]/5 border border-[var(--color-error)]/20 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-error)]/10 rounded-full blur-[40px] pointer-events-none" />
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                  <Trash2 className="w-5 h-5 text-[var(--color-error)]" />
                  <h3 className="text-lg font-black tracking-tight text-[var(--color-error)] uppercase">Danger Zone</h3>
                 </div>
                 <p className="text-sm text-[var(--color-on-surface-variant)] mb-6 font-semibold">
                   Once you delete your account, there is no going back. Please be certain.
                 </p>
                 <button 
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/30 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--color-error)] hover:text-white transition-all flex items-center"
                 >
                   Delete Account
                 </button>
               </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
