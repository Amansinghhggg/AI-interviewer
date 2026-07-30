import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Sparkles,
  Clock,
  History,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Award,
  Coins,
  Sliders,
  Plus,
  Minus,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export default function CandidateSubscriptionsPage() {
  const { user, checkAuth } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [customCredits, setCustomCredits] = useState(30);

  // Dynamic pricing rate: <50 credits = ₹2.5/credit, >=50 credits = ₹1.8/credit
  const parsedCustomCredits = Math.max(1, parseInt(customCredits, 10) || 0);
  const customRate = parsedCustomCredits < 50 ? 2.5 : 1.8;
  const customTotalPrice = Math.round(parsedCustomCredits * customRate);

  // User Credit Stats from backend user object
  const availableCredits = user?.credits?.availableCredits ?? 15;
  const totalPurchasedCredits = user?.credits?.totalPurchasedCredits ?? 0;
  const totalBonusCredits = user?.credits?.totalBonusCredits ?? 0;
  const currentPlan = user?.subscription?.planId || 'FREE';

  // Load real transaction / credit history
  useEffect(() => {
    fetchCreditHistory();
  }, []);

  const fetchCreditHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get('/payments/history');
      if (data?.success && Array.isArray(data?.history)) {
        setHistory(data.history);
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Dynamically load Razorpay SDK
  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (plan) => {
    setLoadingPlan(plan.id);
    try {
      const sdkLoaded = await loadRazorpaySDK();
      
      if (!sdkLoaded) {
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
        setLoadingPlan(null);
        return;
      }

      // 1. Create Order on Backend
      const { data: orderData } = await api.post('/payments/create-order', {
        credits: plan.credits,
        amount: plan.price
      });

      if (!orderData?.success) {
        toast.error(orderData?.message || 'Could not initiate payment order');
        setLoadingPlan(null);
        return;
      }

      // 2. Open Razorpay Checkout Modal Popup
      const options = {
        key: orderData.key || "rzp_test_1DP5mmOlF5G5ag",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "InterviewOS AI",
        description: `Purchase ${plan.credits} Credits`,
        order_id: orderData.demoMode ? undefined : orderData.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: "#6366F1" },
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id || orderData.orderId,
              razorpay_payment_id: response.razorpay_payment_id || `pay_demo_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || 'demo_sig',
              demoMode: orderData.demoMode,
            });

            if (verifyRes.data?.success) {
              toast.success(`Successfully added ${plan.credits} Credits!`);
              if (checkAuth) await checkAuth();
              fetchCreditHistory();
            } else {
              toast.error(verifyRes.data?.message || 'Payment verification failed');
            }
          } catch (err) {
            toast.error('Payment verification request failed');
          } finally {
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
            toast('Payment cancelled', { icon: 'ℹ️' });
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      toast.error(error.response?.data?.message || error?.message || 'Could not initiate payment');
      setLoadingPlan(null);
    }
  };

  const creditBundles = [
    {
      id: 'bundle_starter',
      title: 'Starter Pack',
      price: 99,
      credits: 50,
      badge: 'Quick Practice',
      description: 'Perfect for 2-3 standard AI mock interviews with basic report.',
      features: [
        '50 AI Interview Credits',
        'Standard Question & Voice AI',
        'Basic Performance Scores',
        'Never Expires'
      ],
      popular: false,
      color: 'from-blue-500/20 to-indigo-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'bundle_pro',
      title: 'Pro Candidate Pack',
      price: 199,
      credits: 150,
      badge: 'MOST POPULAR',
      description: 'Ideal for serious job seekers taking 5-7 deep-dive interviews.',
      features: [
        '150 AI Interview Credits',
        'Adaptive Technical Sub-Questioning',
        'STAR Method Detailed Scoring',
        'Downloadable PDF Candidate Reports',
        'Priority Voice Processing',
        'Never Expires'
      ],
      popular: true,
      color: 'from-purple-500/30 to-indigo-600/30',
      borderColor: 'border-purple-500'
    },
    {
      id: 'bundle_master',
      title: 'Master Placement Pack',
      price: 399,
      credits: 400,
      badge: 'BEST VALUE',
      description: 'Maximum value for comprehensive company-specific preparation.',
      features: [
        '400 AI Interview Credits',
        'Unlimited Mock Interview Retakes',
        'STAR Behavioral & Coding Sandbox',
        'Complete Session Audio Replays',
        '1-on-1 AI Resume Match Score',
        'Never Expires'
      ],
      popular: false,
      color: 'from-amber-500/20 to-rose-500/20',
      borderColor: 'border-amber-500/40'
    }
  ];

  const faqs = [
    {
      question: "How do Interview Credits work?",
      answer: "Credits are used during your AI mock interviews. Standard voice questions, real-time response analysis, STAR breakdown evaluation, and PDF report generation consume small amounts of credits per interview turn."
    },
    {
      question: "Do my purchased credits expire?",
      answer: "No! Credits purchased via Credit Top-Up Packs never expire. They remain in your account balance indefinitely until you use them for interviews."
    },
    {
      question: "What happens if my internet disconnects during an interview?",
      answer: "Our system automatically saves your interview state. Unused credits from an incomplete session are safely retained in your wallet."
    },
    {
      question: "Is Razorpay safe for online payment?",
      answer: "Yes, Razorpay is India's leading PCI-DSS Level 1 compliant payment gateway. It supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Netbanking, and Wallets with 256-bit encryption."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background-md3,var(--background))] text-[var(--color-on-background,var(--text-primary))] p-4 md:p-8 space-y-8 max-w-7xl mx-auto">

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Subscription & Credit Management</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Power Your AI Mock Interviews
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl">
              Manage your credit wallet balance and top-up credits via Razorpay for instant AI mock interview practice.
            </p>
          </div>

          {/* Quick Active Plan Badge */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Current Balance</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{availableCredits}</span>
                <span className="text-xs text-indigo-300 font-semibold">Credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Plan Selector */}
      <div className="space-y-6">
        <div className="border-b border-[var(--color-surface-variant,var(--border))] pb-4">
          <h2 className="text-xl font-bold text-[var(--color-on-surface)]">Choose Your Credit Plan</h2>
          <p className="text-xs text-[var(--color-on-surface-variant)]">Instant top-up via Razorpay UPI, Cards, Netbanking</p>
        </div>

        {/* CREDIT BUNDLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditBundles.map((bundle) => (
            <div
              key={bundle.id}
              className={`relative flex flex-col justify-between rounded-3xl bg-[var(--color-surface-container-lowest,var(--card))] border ${bundle.borderColor} p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] ${bundle.popular ? 'ring-2 ring-purple-500 shadow-purple-500/10' : ''
                }`}
            >
              {/* Popular Badge */}
              {bundle.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black tracking-widest uppercase shadow-md">
                  {bundle.badge}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[var(--color-on-surface)]">{bundle.title}</h3>
                  <p className="text-xs text-[var(--color-on-surface-variant)] min-h-[36px]">{bundle.description}</p>
                </div>

                {/* Price */}
                <div className="p-4 rounded-2xl bg-[var(--color-surface-container-low,var(--card))] border border-[var(--color-surface-variant,var(--border))] flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-[var(--color-on-surface)]">₹{bundle.price}</span>
                    <span className="text-xs text-[var(--color-on-surface-variant)] ml-1">one-time</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-indigo-400 block">{bundle.credits}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-on-surface-variant)] font-bold">Credits</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--color-surface-variant,var(--border))]">
                <button
                  onClick={() => handlePurchase(bundle)}
                  disabled={loadingPlan === bundle.id}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${bundle.popular
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25'
                    : 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-primary-md3)] hover:text-white'
                    }`}
                >
                  {loadingPlan === bundle.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Buy {bundle.credits} Credits (₹{bundle.price})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Credits Calculator Widget */}
        <div className="bg-[var(--color-surface-container-lowest,var(--card))] border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" />
                <span>Custom Credit Quantity</span>
              </div>
              <h3 className="text-2xl font-black text-white">Need a Specific Amount of Credits?</h3>
              <p className="text-xs md:text-sm text-slate-300">
                Buy any custom number of credits tailored to your practice needs.
              </p>

              {/* Quick Preset Pill Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-slate-400 font-semibold mr-1">Quick Select:</span>
                {[20, 35, 50, 75, 100, 250].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCustomCredits(preset)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${parsedCustomCredits === preset
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                  >
                    {preset} Credits
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input & Buy Block */}
            <div className="w-full lg:w-auto min-w-[320px] bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 space-y-5 shadow-xl shrink-0">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Enter Credits</label>
              </div>

              {/* Counter Input */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCustomCredits(Math.max(1, parsedCustomCredits - 5))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600/30 text-white transition-all"
                  aria-label="Decrease credits"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={customCredits}
                  onChange={(e) => setCustomCredits(e.target.value)}
                  className="flex-1 text-center py-2.5 px-3 rounded-xl bg-slate-950 border border-indigo-500/40 text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <button
                  onClick={() => setCustomCredits(parsedCustomCredits + 5)}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600/30 text-white transition-all"
                  aria-label="Increase credits"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Price Display */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                  <span className="text-2xl font-black text-white">₹{customTotalPrice}</span>
                </div>

              </div>

              <button
                onClick={() => handlePurchase({
                  id: `custom_${parsedCustomCredits}`,
                  title: `Custom Pack (${parsedCustomCredits} Credits)`,
                  price: customTotalPrice,
                  credits: parsedCustomCredits
                })}
                disabled={loadingPlan === `custom_${parsedCustomCredits}` || parsedCustomCredits <= 0}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
              >
                {loadingPlan === `custom_${parsedCustomCredits}` ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Buy {parsedCustomCredits} Credits</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Transaction History */}
      <div className="bg-[var(--color-surface-container-lowest,var(--card))] border border-[var(--color-surface-variant,var(--border))] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-on-surface)]">Credit Transaction History</h3>
              <p className="text-xs text-[var(--color-on-surface-variant)]">Track your credit purchases and mock interview usage</p>
            </div>
          </div>
        </div>

        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--color-on-surface-variant)]">
            No transaction records found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-surface-variant,var(--border))] text-[var(--color-on-surface-variant)] uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Credits</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-variant,var(--border))]">
                {history.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--color-surface-container-low,var(--card))]/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[var(--color-on-surface-variant)]">{tx.date}</td>
                    <td className="py-4 px-4 font-bold text-[var(--color-on-surface)]">{tx.description}</td>
                    <td className="py-4 px-4 text-right font-black text-emerald-400">
                      +{tx.credits}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-[var(--color-on-surface)]">
                      {tx.amount === 0 ? 'Free' : `₹${tx.amount}`}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-[var(--color-surface-container-lowest,var(--card))] border border-[var(--color-surface-variant,var(--border))] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-on-surface)]">Frequently Asked Questions</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)]">Everything you need to know about credits & Razorpay billing</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-[var(--color-surface-variant,var(--border))] rounded-2xl overflow-hidden bg-[var(--color-surface-container-low,var(--card))]"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-4 text-left font-bold text-xs md:text-sm text-[var(--color-on-surface)] flex items-center justify-between gap-4 hover:text-indigo-400 transition-colors"
              >
                <span>{faq.question}</span>
                {openFaq === index ? <ChevronUp className="w-4 h-4 shrink-0 text-indigo-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-[var(--color-on-surface-variant)]" />}
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4 text-xs text-[var(--color-on-surface-variant)] border-t border-[var(--color-surface-variant,var(--border))]/50 pt-3 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security & Razorpay Assurance Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          <span>Secured with 256-bit SSL encryption & PCI-DSS Compliant Razorpay Gateway.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 font-semibold">
          <span>UPI</span>
          <span>•</span>
          <span>GPay</span>
          <span>•</span>
          <span>PhonePe</span>
          <span>•</span>
          <span>Cards</span>
          <span>•</span>
          <span>Netbanking</span>
        </div>
      </div>

    </div>
  );
}
