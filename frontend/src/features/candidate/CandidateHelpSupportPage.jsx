import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  HelpCircle,
  Mic,
  Camera,
  Wifi,
  Key,
  FileText,
  MessageSquare,
  Mail,
  Send,
  Loader2,
  ChevronDown,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Headphones,
  RefreshCw,
  PhoneCall,
  History,
  Clock,
  MessageCircleQuestion,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../../ui/primitives/PageHeader";
import { GlassCard } from "../../ui/primitives/GlassCard";
import { SectionHeader } from "../../ui/primitives/SectionHeader";

const FAQ_DATA = [
  {
    id: "mic-permissions",
    category: "audio",
    icon: Mic,
    question: "How do I fix microphone permissions denied in my browser?",
    answer:
      "Click the lock/settings icon next to the URL address bar in Chrome/Edge, find 'Microphone', and change it to 'Allow'. Then refresh the page. Ensure no other application (like Zoom or Teams) is using your mic in the background.",
  },
  {
    id: "mic-no-sound",
    category: "audio",
    icon: Headphones,
    question: "The AI interviewer cannot hear me or volume meter is not moving.",
    answer:
      "Check your device settings to make sure your correct microphone is selected as default input. Use headphones with built-in mic if possible to prevent echo. You can test your microphone volume live on the Pre-Interview system check screen.",
  },
  {
    id: "camera-black-screen",
    category: "camera",
    icon: Camera,
    question: "Camera screen is black or showing 'No camera found' error.",
    answer:
      "1. Grant camera permission in browser settings.\n2. Ensure your webcam isn't physically covered or disabled via hardware switch.\n3. Close other apps that might be accessing your camera.\n4. Restart your browser or reconnect external USB webcams.",
  },
  {
    id: "proctoring-warning",
    category: "camera",
    icon: ShieldAlert,
    question: "Why am I getting 'No Face Detected' or 'Multiple Faces Detected' alerts?",
    answer:
      "Our AI proctoring monitors face presence for interview integrity. Ensure your face is clearly visible, well-lit from the front, and centred in frame. Avoid sitting in direct backlighting or having other people enter the camera view.",
  },
  {
    id: "disconnection-resume",
    category: "network",
    icon: RefreshCw,
    question: "What happens if my internet disconnects or browser closes during interview?",
    answer:
      "Don't panic! Your session progress and completed question recordings are saved in real-time. Simply open your interview link again or re-enter your code to resume right where you left off.",
  },
  {
    id: "network-lag",
    category: "network",
    icon: Wifi,
    question: "Audio/Video is lagging or question loading is slow.",
    answer:
      "A stable internet connection with at least 2-5 Mbps download/upload speed is recommended. Close heavy background downloads, torrents, or streaming tabs. Switch to a 5GHz Wi-Fi network or ethernet cable if available.",
  },
  {
    id: "access-code-invalid",
    category: "access",
    icon: Key,
    question: "My interview invitation code or link says 'Expired' or 'Invalid'.",
    answer:
      "Verify that you entered the code accurately (codes are case-sensitive). If the hiring campaign deadline has passed, reach out directly to the employer recruiter or submit a support request below.",
  },
  {
    id: "resume-update",
    category: "profile",
    icon: FileText,
    question: "How do I update my resume or candidate profile details?",
    answer:
      "Go to Profile from the sidebar navigation menu. You can upload a new PDF resume anytime. Employers evaluating your interview will see your latest uploaded profile resume.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "audio", label: "Microphone & Audio" },
  { id: "camera", label: "Camera & Proctoring" },
  { id: "network", label: "Network & Disconnection" },
  { id: "access", label: "Interview Access Links" },
  { id: "profile", label: "Resume & Profile" },
];

export default function CandidateHelpSupportPage() {
  const { user } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState("support"); // 'support' | 'history'

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState("mic-permissions");

  // Support Form State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [category, setCategory] = useState("audio");
  const [interviewCode, setInterviewCode] = useState("");
  const [priority, setPriority] = useState("normal");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tickets History State
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Fetch candidate's tickets history
  const fetchMyTickets = async () => {
    setLoadingTickets(true);
    try {
      const { data } = await api.get("/complaints/my-tickets");
      if (data.success && Array.isArray(data.tickets)) {
        setMyTickets(data.tickets);
      }
    } catch (err) {
      console.warn("Failed to load tickets history:", err.message);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      return toast.error("Please provide a description of the issue.");
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post("/complaints", {
        name,
        email,
        category,
        interviewCode,
        urgency: priority,
        message,
      });

      if (data.success) {
        toast.success(`Support Ticket #${data.ticket.ticketId} created successfully!`);
        setMessage("");
        setInterviewCode("");
        await fetchMyTickets();
        setActiveMainTab("history");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit support request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3 h-3 animate-spin" /> Pending Review
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin" /> In Investigation
          </span>
        );
      case "RESOLVED":
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="px-3 py-1 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/30 text-[10px] font-black uppercase tracking-wider">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const adminEmail = "intervuos@gmail.com";
  const whatsappNumber = "+91 86550 21064";
  const whatsappCleanNumber = "8655021064";

  return (
    <div className="bg-transparent min-h-screen text-[var(--color-on-surface,#dae2fd)] font-['Inter'] pb-24">
      <div className="max-w-[1300px] mx-auto p-4 md:p-8 space-y-8">

        {/* Page Header */}
        <PageHeader
          badgeIcon={HelpCircle}
          badgeText="Candidate Contact & Complaint Support Portal"
          title="Contact Us & Help Desk"
          description="Troubleshoot audio/video issues, contact support by submitting a complaint ticket, and track real-time admin responses."
        />

        {/* Main Tab Switcher */}
        <div className="flex items-center justify-center border-b border-[var(--color-surface-variant)] pb-4">
          <div className="flex items-center gap-2 p-1.5 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl shadow-lg">
            <button
              onClick={() => setActiveMainTab("support")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeMainTab === "support"
                ? "bg-[var(--color-primary-md3)] text-white shadow-md shadow-[var(--color-primary-md3)]/30"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Contact Us & Submit Ticket</span>
            </button>

            <button
              onClick={() => setActiveMainTab("history")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeMainTab === "history"
                ? "bg-[var(--color-primary-md3)] text-white shadow-md shadow-[var(--color-primary-md3)]/30"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                }`}
            >
              <History className="w-4 h-4" />
              <span>My Ticket History</span>
              {myTickets.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black">
                  {myTickets.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: SUBMIT TICKET & FAQS */}
        {activeMainTab === "support" && (
          <div className="space-y-12">

            {/* Contact Us & Complaint Submission Form (ABOVE) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

              {/* Left Column: Direct Hotline Desks */}
              <div className="lg:col-span-1 space-y-6">
                <GlassCard padding="p-6 md:p-8" className="h-full flex flex-col justify-between">
                  <div>
                    <SectionHeader
                      icon={PhoneCall}
                      title="Direct Support Hotlines"
                      subtitle="Facing an urgent issue during an active interview session?"
                    />

                    <div className="space-y-4 mt-6">
                      {/* WhatsApp Desk */}
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            WhatsApp Candidate Hotline
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase tracking-wider">
                            Live Desk
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-xs font-bold text-[var(--color-on-surface)]">
                            {whatsappNumber}
                          </span>
                          <a
                            href={`https://wa.me/${whatsappCleanNumber}?text=Hi%20InterviewOS%20Support,%20I%20am%20a%20candidate%20facing%20an%20issue%20with%20my%20interview.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 shrink-0"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Chat
                          </a>
                        </div>
                      </div>

                      {/* Email Support */}
                      <div className="p-4 rounded-2xl bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[var(--color-primary-md3)]" />
                          Support Email
                        </span>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-xs font-bold text-[var(--color-on-surface)] select-all truncate">
                            {adminEmail}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(adminEmail);
                              toast.success("Support email copied to clipboard!");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[var(--color-primary-md3)]/10 hover:bg-[var(--color-primary-md3)]/20 text-[var(--color-primary-md3)] text-[10px] font-bold uppercase tracking-wider transition-colors border border-[var(--color-primary-md3)]/30"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Live Session Tip
                    </span>
                    <p className="text-[11px] text-amber-200/80 leading-relaxed">
                      If your internet drops mid-interview, your session timer pauses automatically. Refreshing your link allows instant session continuation!
                    </p>
                  </div>
                </GlassCard>
              </div>

              {/* Right Column: Complaint Ticket Form */}
              <div className="lg:col-span-2">
                <GlassCard padding="p-6 md:p-8" className="space-y-6">
                  <SectionHeader
                    icon={Send}
                    title="Submit Ticket to Complaint Database"
                    subtitle="Report a technical issue, proctoring warning, or access link error directly to our team."
                  />

                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-[var(--color-on-surface-variant)]">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-3 text-xs text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary-md3)]"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-[var(--color-on-surface-variant)]">
                          Your Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="candidate@example.com"
                          className="w-full bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-3 text-xs text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary-md3)]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Issue Category */}
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-[var(--color-on-surface-variant)]">
                          Issue Category *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-3 text-xs text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary-md3)]"
                        >
                          <option value="audio">🎤 Microphone / Audio Issue</option>
                          <option value="camera">📹 Camera / Proctoring Warning</option>
                          <option value="network">🌐 Network / Connection Crash</option>
                          <option value="access">🔑 Invalid Code / Link Expired</option>
                          <option value="other">💬 Other General Question</option>
                        </select>
                      </div>

                      {/* Interview Code (Optional) */}
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-[var(--color-on-surface-variant)]">
                          Interview Code / ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={interviewCode}
                          onChange={(e) => setInterviewCode(e.target.value)}
                          placeholder="e.g. INT-928310"
                          className="w-full bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-3 text-xs text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary-md3)]"
                        />
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-[var(--color-on-surface-variant)]">
                        Issue Urgency Level
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "normal", label: "Normal (General)" },
                          { id: "medium", label: "Medium (Upcoming)" },
                          { id: "urgent", label: "Urgent (Live Session)" },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPriority(p.id)}
                            className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${priority === p.id
                              ? p.id === "urgent"
                                ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30"
                                : "bg-[var(--color-primary-md3)] text-white border-[var(--color-primary-md3)] shadow-md shadow-[var(--color-primary-md3)]/30"
                              : "bg-[var(--color-surface-container-highest)]/30 text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30 hover:text-[var(--color-on-surface)]"
                              }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-[var(--color-on-surface-variant)]">
                        Describe the issue experienced *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please detail your experience (e.g. Mic input stopped working during Question 2)..."
                        className="w-full bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 rounded-xl px-4 py-3 text-xs text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary-md3)] resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting Ticket to Database...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Ticket
                        </>
                      )}
                    </button>
                  </form>
                </GlassCard>
              </div>
            </div>

            {/* Section Divider */}
            <div className="border-t border-[var(--color-surface-variant)]/40 my-8" />

            {/* Search & Topic Filters (BELOW) */}
            <div className="space-y-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-on-surface-variant)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search issues (e.g. microphone, camera black screen, network disconnect)..."
                  className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl pl-12 pr-4 py-4 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/60 focus:outline-none focus:border-[var(--color-primary-md3)] transition-all shadow-lg"
                />
              </div>

              {/* Category Badges */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeCategory === cat.id
                      ? "bg-[var(--color-primary-md3)] text-white border-[var(--color-primary-md3)] shadow-md shadow-[var(--color-primary-md3)]/30"
                      : "bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] border-[var(--color-surface-variant)] hover:bg-[var(--color-surface-variant)]/50 hover:text-[var(--color-on-surface)]"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQs Section (BELOW) */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <SectionHeader
                icon={Sparkles}
                title="Frequently Asked Candidate Questions"
                subtitle="Step-by-step troubleshooting guides for common technical issues during AI interviews."
              />

              {filteredFaqs.length === 0 ? (
                <GlassCard padding="p-8" className="text-center space-y-3">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto opacity-80" />
                  <h3 className="text-base font-bold text-[var(--color-on-surface)]">No matching guide found</h3>
                  <p className="text-xs text-[var(--color-on-surface-variant)] max-w-md mx-auto">
                    Try searching with different keywords or submit a ticket above to get direct help from our team.
                  </p>
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq) => {
                    const isOpen = openFaqId === faq.id;
                    const IconComponent = faq.icon;
                    return (
                      <div
                        key={faq.id}
                        className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl overflow-hidden shadow-md transition-all hover:border-[var(--color-primary-md3)]/40"
                      >
                        <button
                          onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                          className="w-full p-5 flex items-center justify-between gap-4 text-left transition-colors hover:bg-[var(--color-surface-variant)]/20"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] flex items-center justify-center shrink-0 border border-[var(--color-primary-md3)]/20">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-[var(--color-on-surface)] tracking-tight">
                              {faq.question}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-[var(--color-on-surface-variant)] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[var(--color-primary-md3)]" : ""
                              }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="px-5 pb-5 pt-1 text-xs md:text-sm text-[var(--color-on-surface-variant)] leading-relaxed font-medium whitespace-pre-line border-t border-[var(--color-surface-variant)]/40 bg-[var(--color-surface-container-lowest)]/50 pl-16"
                            >
                              {faq.answer}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY TICKETS & HISTORY */}
        {activeMainTab === "history" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <SectionHeader
              icon={History}
              title="My Ticket History & Admin Responses"
              subtitle="Track submitted complaints, status updates, and official administrator responses in real-time."
            />

            {loadingTickets ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-md3)]" />
              </div>
            ) : myTickets.length === 0 ? (
              <GlassCard padding="p-12" className="text-center space-y-4">
                <MessageCircleQuestion className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto opacity-50" />
                <h3 className="text-lg font-bold text-[var(--color-on-surface)]">No Support Tickets Found</h3>
                <p className="text-xs text-[var(--color-on-surface-variant)] max-w-md mx-auto">
                  You haven't submitted any complaints or support requests yet.
                </p>
                <button
                  onClick={() => setActiveMainTab("support")}
                  className="px-5 py-2.5 bg-[var(--color-primary-md3)] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Submit a Support Ticket
                </button>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket._id || ticket.ticketId}
                    className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden"
                  >
                    {/* Ticket Header Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--color-surface-variant)]/50 pb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 rounded-xl bg-[var(--color-primary-md3)]/15 border border-[var(--color-primary-md3)]/30 text-[var(--color-primary-md3)] text-xs font-black uppercase tracking-widest font-mono">
                          {ticket.ticketId}
                        </span>
                        {getStatusBadge(ticket.status)}
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] text-[10px] font-bold uppercase tracking-wider">
                          Category: {ticket.category}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-[var(--color-on-surface-variant)] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Candidate Message */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                        Your Complaint Description:
                      </span>
                      <p className="text-xs md:text-sm text-[var(--color-on-surface)] leading-relaxed font-medium bg-[var(--color-surface-container-lowest)]/50 p-4 rounded-2xl border border-[var(--color-surface-variant)]/30">
                        {ticket.message}
                      </p>
                    </div>

                    {/* Admin Response Section */}
                    {ticket.adminNotes ? (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-wider">
                            Official Admin Response & Notes
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-emerald-200 leading-relaxed font-medium pl-6">
                          {ticket.adminNotes}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Support desk review pending. An administrator response will appear here once updated.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
