import React, { useEffect, useState } from 'react';
import { useCandidateReview } from '../hooks/useCandidateReview.js';
import { REVIEW_STATES } from '../config/constants.js';
import { TIMELINE_EVENT_TYPES } from '../../replay/config/constants.js';
import { useReplay } from '../../replay/hooks/useReplay.js';
import { ReplayPlayer } from '../../replay/components/ReplayPlayer.jsx';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';
import { 
    Mail, Briefcase, Building2, Calendar, Info, ThumbsUp, AlertCircle, 
    Play, ChevronDown, ShieldCheck, Sparkles, Home, Users, BookOpen, 
    Settings, HelpCircle, LogOut, RotateCcw
} from 'lucide-react';

export const CandidateWorkspace = ({ resultData, onReEnroll }) => {
    const { state, actions } = useCandidateReview();
    const { currentTime, controls, timeline, activeEntries } = useReplay(); // Hook into replay for session details timestamps
    const [activeTab, setActiveTab] = useState('evaluation'); // 'evaluation' | 'session-details'
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    useEffect(() => {
        if (resultData) {
            actions.loadSession(resultData);
        }
    }, [resultData, actions]);

    if (!resultData) return null;

    if (state === REVIEW_STATES.LOADING) {
        return (
            <div className="p-12 text-center text-[var(--color-text-muted)] animate-pulse">
                Loading Candidate Workspace...
            </div>
        );
    }

    if (state === REVIEW_STATES.ERROR) {
        return (
            <div className="p-12 text-center text-[var(--color-danger)] font-bold">
                Failed to load candidate data.
            </div>
        );
    }

    const { candidate, interview, summary, evaluation, charts, questionBreakdown } = resultData;

    const formattedDate = interview?.createdAt 
        ? new Date(interview.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Unknown Date';

    // FIX 1: Overall Score uses summary.overallScore
    const overallScore = summary?.overallScore || evaluation?.score || 0;
    const isPassing = overallScore >= 7;

    // Recharts Data Mapping
    const radarData = [
        { subject: "Technical", A: (charts?.technical || 0) * 10, fullMark: 100 },
        { subject: "Communication", A: (charts?.communication || 0) * 10, fullMark: 100 },
        { subject: "Problem Solving", A: (charts?.problemSolving || 0) * 10, fullMark: 100 },
        { subject: "Confidence", A: (charts?.confidence || 0) * 10, fullMark: 100 },
    ];

    // Extract actual question timestamps from Replay Timeline
    const questionsTimeline = timeline?.filter(t => t.type === TIMELINE_EVENT_TYPES.QUESTION) || [];
    
    // Find active question based on useReplay activeEntries
    const activeQuestionId = activeEntries?.find(e => e.type === TIMELINE_EVENT_TYPES.QUESTION)?.id;

    return (
        <div className="flex bg-[var(--color-background-md3)] text-[var(--color-on-background)] font-['Inter']">
            {/* Main Content Area */}
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 pb-4">
                {/* Header: Candidate Info */}
                <header className="shrink-0 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden group shadow-lg">
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-24 h-24 rounded-2xl bg-[var(--color-surface-variant)] flex items-center justify-center text-4xl font-bold text-[var(--color-primary-md3)] shadow-2xl border border-[var(--color-outline-variant)]/30">
                                {candidate?.name ? candidate.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-4xl font-black text-[var(--color-on-surface)] tracking-tight mb-1">
                                        {candidate?.name || 'Candidate'}
                                    </h2>
                                    <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)]">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-base font-medium">{candidate?.email || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div className="px-4 py-1.5 bg-[var(--color-surface-container-high)] rounded-full flex items-center gap-2 border border-[var(--color-outline-variant)]/30">
                                        <Briefcase className="w-4 h-4 text-[var(--color-primary-md3)]" />
                                        <span className="text-[11px] font-black uppercase tracking-wider">
                                            {interview?.jobRole || 'Applicant'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-1.5 bg-[var(--color-surface-container-high)] rounded-full flex items-center gap-2 border border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface-variant)]">
                                        <Building2 className="w-4 h-4" />
                                        <span className="text-[11px] font-black uppercase tracking-wider">Intervu AI</span>
                                    </div>
                                    <div className="px-4 py-1.5 bg-[var(--color-surface-container-high)] rounded-full flex items-center gap-2 border border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface-variant)]">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[11px] font-black uppercase tracking-wider">{formattedDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Absolute right-bottom Re-Enroll Button */}
                        {onReEnroll && (
                            <div className="absolute bottom-6 right-6 z-20">
                                <button 
                                    onClick={onReEnroll}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)] border border-[var(--color-error)]/30 rounded-xl transition-all shadow-sm font-bold text-[11px] uppercase tracking-wider group"
                                >
                                    <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300" />
                                    Re-Enroll Candidate
                                </button>
                            </div>
                        )}

                        {/* Score removed from here */}
                        <div className="absolute right-0 top-0 w-[40%] h-full bg-gradient-to-l from-[var(--color-primary-md3)]/10 to-transparent opacity-50 pointer-events-none transition-opacity"></div>
                    </header>

                    {/* Navigation Tabs */}
                    <div className="shrink-0 flex gap-4 border-b border-[var(--color-outline-variant)]/30 mb-8 overflow-x-auto pb-1 hide-scrollbar">
                        <button 
                            onClick={() => setActiveTab('evaluation')}
                            className={`px-2 py-4 text-[12px] font-black uppercase tracking-[0.15em] border-b-2 transition-all whitespace-nowrap ${
                                activeTab === 'evaluation' 
                                ? 'border-[var(--color-primary-md3)] text-[var(--color-primary-md3)]' 
                                : 'border-transparent text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary-md3)]'
                            }`}
                        >
                            Evaluation
                        </button>
                        <button 
                            onClick={() => setActiveTab('session-details')}
                            className={`px-2 py-4 text-[12px] font-black uppercase tracking-[0.15em] border-b-2 transition-all whitespace-nowrap ${
                                activeTab === 'session-details' 
                                ? 'border-[var(--color-primary-md3)] text-[var(--color-primary-md3)]' 
                                : 'border-transparent text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary-md3)]'
                            }`}
                        >
                            Session Details
                        </button>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="w-full">
                        {/* Tab Content: Evaluation */}
                        {activeTab === 'evaluation' && (
                            <div className="animate-fade-in-up">
                            
                            {/* Unified Top Row: AI Summary + Performance */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-8 mb-8">
                                {/* AI Summary */}
                                <section className="lg:col-span-2 xl:col-span-3 bg-[var(--color-surface-container-low)] border border-[var(--color-primary-md3)]/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(139,92,246,0.1)] relative overflow-hidden flex flex-col">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary-md3)]/10 rounded-full blur-[40px] pointer-events-none"></div>
                                    <div className="flex items-start justify-between relative z-10 shrink-0 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-md3)]/10 flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-[var(--color-primary-md3)]" />
                                            </div>
                                            <h3 className="text-sm font-black tracking-tight text-[var(--color-on-surface)] uppercase">AI Summary</h3>
                                        </div>
                                        <div className={`border rounded-full px-3 py-1 inline-flex items-center gap-2 ${isPassing ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]' : 'bg-[var(--color-error)]/10 border-[var(--color-error)]/30 text-[var(--color-error)]'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isPassing ? 'bg-[var(--color-success)] shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-[var(--color-error)] shadow-[0_0_8px_rgba(255,180,171,0.5)]'}`}></span>
                                            <span className="text-[9px] font-black uppercase tracking-widest">{isPassing ? 'Recommended' : 'Needs Improvement'}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 relative z-10 overflow-y-auto pr-2 custom-scrollbar flex flex-col justify-center">
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className={`text-[64px] font-black leading-none tracking-tighter ${isPassing ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                                                {Number(overallScore).toFixed(1)}
                                            </span>
                                            <span className="text-xl text-[var(--color-on-surface-variant)] font-bold">/10</span>
                                        </div>
                                        {summary?.reasoning && (
                                            <p className="text-sm text-[var(--color-on-surface)] leading-relaxed italic border-l-2 border-[var(--color-primary-md3)]/50 pl-4">
                                                "{summary.reasoning}"
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* Radar Chart Section */}
                                <section className="lg:col-span-1 xl:col-span-1 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl p-6 flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-md3)]/10 flex items-center justify-center">
                                                <AlertCircle className="w-4 h-4 text-[var(--color-primary-md3)]" />
                                            </div>
                                            <h3 className="text-sm font-black tracking-tight text-[var(--color-on-surface)] uppercase">Performance Analytics</h3>
                                        </div>
                                    </div>
                                    <div className="relative w-full aspect-square mx-auto flex items-center justify-center min-h-[250px] max-w-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                                <PolarGrid gridType="circle" stroke="var(--color-outline-variant)" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--color-on-surface-variant)", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: "var(--color-surface-container-high)", border: "1px solid var(--color-outline-variant)", borderRadius: "8px", color: "var(--color-on-surface)" }}
                                                    itemStyle={{ color: "var(--color-primary-md3)", fontWeight: "bold" }}
                                                    formatter={(value) => [`${value}%`, "Score"]}
                                                />
                                                <Radar
                                                    name="Score"
                                                    dataKey="A"
                                                    stroke="var(--color-primary-md3)"
                                                    fill="var(--color-primary-md3)"
                                                    fillOpacity={0.3}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </section>

                                {/* Detailed Progress Bars */}
                                <section className="lg:col-span-1 xl:col-span-1 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl p-6 flex flex-col">
                                    <h3 className="text-sm font-black text-[var(--color-on-surface)] tracking-tight uppercase mb-8 shrink-0">Metric Breakdown</h3>
                                    <div className="space-y-8 flex-1 flex flex-col justify-center">
                                        {[
                                            { label: 'Technical Ability', score: charts?.technical || 0 },
                                            { label: 'Communication', score: charts?.communication || 0 },
                                            { label: 'Confidence', score: charts?.confidence || 0 },
                                            { label: 'Problem Solving', score: charts?.problemSolving || 0 }
                                        ].map((metric, idx) => (
                                            <div key={idx}>
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-[11px] font-bold text-[var(--color-on-surface)] uppercase tracking-wider">{metric.label}</span>
                                                    <span className={`text-sm font-black ${metric.score >= 7 ? 'text-[var(--color-primary-md3)]' : metric.score >= 5 ? 'text-[var(--color-warning)]' : 'text-[var(--color-error)]'}`}>
                                                        {metric.score.toFixed(1)}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-[var(--color-surface-variant)] rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${metric.score >= 7 ? 'bg-[var(--color-primary-md3)]' : metric.score >= 5 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-error)]'}`}
                                                        style={{ width: `${(metric.score / 10) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Strengths and Weaknesses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl p-6 border-l-4 border-l-[var(--color-tertiary)]">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-tertiary)]/10 flex items-center justify-center text-[var(--color-tertiary)]">
                                            <ThumbsUp className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.1em] text-[var(--color-on-surface)]">Key Strengths</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {summary?.strengths?.map((strength, i) => (
                                            <li key={i} className="flex gap-4 group">
                                                <span className="text-[var(--color-tertiary)] mt-0.5 font-bold text-xs">0{i + 1}</span>
                                                <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">{strength}</p>
                                            </li>
                                        ))}
                                        {(!summary?.strengths || summary.strengths.length === 0) && (
                                            <p className="text-sm text-[var(--color-on-surface-variant)]">No specific strengths identified.</p>
                                        )}
                                    </ul>
                                </div>
                                
                                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl p-6 border-l-4 border-l-[var(--color-error)]">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center text-[var(--color-error)]">
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.1em] text-[var(--color-on-surface)]">Areas For Growth</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {summary?.weaknesses?.map((weakness, i) => (
                                            <li key={i} className="flex gap-4 group">
                                                <span className="text-[var(--color-error)] mt-0.5 font-bold text-xs">0{i + 1}</span>
                                                <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">{weakness}</p>
                                            </li>
                                        ))}
                                        {(!summary?.weaknesses || summary.weaknesses.length === 0) && (
                                            <p className="text-sm text-[var(--color-on-surface-variant)]">No specific weaknesses identified.</p>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Question Breakdown */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-1.5 h-6 bg-[var(--color-primary-md3)] rounded-full"></div>
                                    <h3 className="text-xs font-black text-[var(--color-on-surface)] tracking-widest uppercase">Deep Dive: Question Breakdown</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    {questionBreakdown?.map((q, idx) => {
                                        const qScore = q.scores?.overall || q.scores?.technical || q.score || 0;
                                        return (
                                        <div key={idx} className="bg-[var(--color-surface-container-low)] rounded-2xl overflow-hidden border border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary-md3)]/50 transition-all group">
                                            <div 
                                                className="p-6 flex items-center justify-between cursor-pointer"
                                                onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all shadow-lg ${expandedQuestion === idx ? 'bg-[var(--color-primary-md3)] text-white' : 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'}`}>
                                                        0{idx + 1}
                                                    </div>
                                                    <h4 className={`text-base font-bold transition-colors ${expandedQuestion === idx ? 'text-[var(--color-primary-md3)]' : 'text-[var(--color-on-surface)]'}`}>
                                                        {q.question}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="hidden md:flex gap-4">
                                                        <div className="text-right">
                                                            <p className={`text-sm font-black ${qScore >= 7 ? 'text-[var(--color-primary-md3)]' : 'text-[var(--color-error)]'}`}>{qScore}/10</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`w-5 h-5 text-[var(--color-on-surface-variant)] transition-all duration-300 transform ${expandedQuestion === idx ? 'rotate-180 text-[var(--color-primary-md3)]' : 'rotate-0'}`} />
                                                </div>
                                            </div>
                                            
                                            {/* Accordion Content */}
                                            <div className={`px-6 pb-6 ${expandedQuestion === idx ? 'block' : 'hidden'}`}>
                                                <div className="pt-6 border-t border-[var(--color-outline-variant)]/30 grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest">Topic</p>
                                                        <p className="text-xs font-bold text-[var(--color-on-surface)]">{q.category || q.topic || 'General'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest">Complexity</p>
                                                        <span className="px-2 py-0.5 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border border-[var(--color-secondary)]/20 rounded text-[9px] font-black uppercase">{q.difficulty || 'Intermediate'}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest">Tech Insight</p>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-xl font-black text-[var(--color-primary-md3)]">{qScore}</span>
                                                            <span className="text-[10px] text-[var(--color-on-surface-variant)] font-bold">/10</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest">Status</p>
                                                        <span className="px-2 py-0.5 bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] border border-[var(--color-primary-md3)]/20 rounded text-[9px] font-black uppercase">Evaluated</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mb-4 p-4 bg-[var(--color-surface-container-lowest)] rounded-lg border border-[var(--color-outline-variant)]/30">
                                                    <p className="text-[9px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">Candidate Answer</p>
                                                    <p className="text-xs text-[var(--color-on-surface)] leading-relaxed italic">
                                                        "{q.answer || 'No answer recorded.'}"
                                                    </p>
                                                </div>

                                                <div className="p-4 bg-[var(--color-surface-variant)]/30 rounded-lg border border-[var(--color-outline-variant)]/30">
                                                    <p className="text-[9px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">AI Summary</p>
                                                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                                                        {q.feedback}
                                                    </p>
                                                    
                                                    {q.reasoning && (
                                                        <div className="mt-4 pt-4 border-t border-[var(--color-outline-variant)]/30">
                                                            <p className="text-[9px] font-black text-[var(--color-primary-md3)] uppercase tracking-widest mb-2">Evaluation Reasoning</p>
                                                            <p className="text-xs text-[var(--color-on-surface)] leading-relaxed italic border-l-2 border-[var(--color-primary-md3)]/50 pl-3">
                                                                {q.reasoning}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Tab Content: Session Details (Replay) */}
                    {activeTab === 'session-details' && (
                        <div className="space-y-8 animate-fade-in-up">
                            <section className="bg-[var(--color-surface-container-low)] rounded-2xl overflow-hidden border border-[var(--color-outline-variant)]/30 shadow-xl">
                                <div className="border-b border-[var(--color-outline-variant)]/30">
                                    <div className="grid grid-cols-1 lg:grid-cols-5">
                                        <div className="lg:col-span-3 p-5 flex items-center justify-between border-r border-[var(--color-outline-variant)]/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1 h-5 bg-[var(--color-primary-md3)] rounded-full"></div>
                                                <h3 className="text-xs font-black text-[var(--color-on-surface)] tracking-widest uppercase">Session Replay</h3>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse"></span>
                                                <span className="text-[9px] font-black text-[var(--color-success)] uppercase tracking-widest hidden xl:inline-block">Verified</span>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-2 p-5 flex items-center">
                                            <h4 className="text-[10px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest">Interview Timestamps</h4>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[300px]">
                                    <div className="lg:col-span-3 bg-black border-r border-[var(--color-outline-variant)]/30 flex items-center justify-center p-4">
                                        <div className="w-full max-w-2xl h-full flex flex-col justify-center rounded-lg overflow-hidden">
                                            <ReplayPlayer />
                                        </div>
                                    </div>
                                    
                                    <div className="lg:col-span-2 bg-[var(--color-surface-container-lowest)] p-6 overflow-y-auto max-h-[500px] flex flex-col gap-3 hide-scrollbar">
                                        {questionsTimeline?.map((q, idx) => {
                                            const isActive = activeQuestionId === q.id;
                                            const m = Math.floor(q.startTime / 60);
                                            const s = Math.floor(q.startTime % 60);
                                            const timeString = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                                            return (
                                                <div 
                                                    key={idx}
                                                    onClick={() => controls.seek(q.startTime)}
                                                    className={`p-4 rounded-xl cursor-pointer transition-all border flex gap-4 ${isActive ? 'bg-[var(--color-primary-md3)]/10 border-[var(--color-primary-md3)]/30 shadow-md' : 'bg-[var(--color-surface-container-lowest)] border-transparent hover:border-[var(--color-outline-variant)]/30'}`}
                                                >
                                                    <span className={`text-xs font-black mt-0.5 min-w-[36px] ${isActive ? 'text-[var(--color-primary-md3)]' : 'text-[var(--color-on-surface-variant)]'}`}>
                                                        {timeString}
                                                    </span>
                                                    <p className={`text-sm font-medium leading-relaxed ${isActive ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-variant)]'}`}>
                                                        {q.payload?.question || (resultData?.questionBreakdown?.[q.payload?.index - 1]?.question) || 'Question'}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                    </div>
                </div>
            </div>
    );
};
