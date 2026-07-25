import React, { useEffect, useState } from 'react';
import { useCandidateReview } from '../hooks/useCandidateReview.js';
import { REVIEW_STATES } from '../config/constants.js';

import CandidateHeader from '../../../ui/results/CandidateHeader';
import ResultSummaryCard from '../../../ui/results/ResultSummaryCard';
import RadarChartCard from '../../../ui/results/RadarChartCard';
import ProgressScoreCard from '../../../ui/results/ProgressScoreCard';
import StrengthsCard from '../../../ui/results/StrengthsCard';
import WeaknessesCard from '../../../ui/results/WeaknessesCard';
import QuestionBreakdownAccordion from '../../../ui/results/QuestionBreakdownAccordion';

import { ReplayWidget } from '../widgets/ReplayWidget.jsx';
import { WarningsTimeline, TranscriptPanel } from '../../replay/index.js';

// ─── Section Header ─────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '16px' }}>
        <h3 style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        }}>
            <span style={{
                display: 'inline-block',
                width: '3px',
                height: '18px',
                borderRadius: '2px',
                background: 'linear-gradient(180deg, var(--color-accent-blue), var(--color-accent-violet))',
                flexShrink: 0,
            }} />
            {title}
        </h3>
        {subtitle && (
            <p style={{ margin: '4px 0 0 13px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {subtitle}
            </p>
        )}
    </div>
);

export const CandidateWorkspace = ({ resultData }) => {
    const { state, actions } = useCandidateReview();
    const [activeTab, setActiveTab] = useState('evaluation'); // 'evaluation' | 'session-details'

    useEffect(() => {
        if (resultData) {
            actions.loadSession(resultData);
        }
    }, [resultData, actions]);

    if (!resultData) return null;

    if (state === REVIEW_STATES.LOADING) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Loading Candidate Workspace...
            </div>
        );
    }

    if (state === REVIEW_STATES.ERROR) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-accent-red)' }}>
                Failed to load candidate data.
            </div>
        );
    }

    const { candidate, interview, summary, evaluation, charts, questionBreakdown } = resultData;

    return (
        <div
            className="candidate-workspace"
            style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
            }}
        >
            {/* ── 1. Candidate Header ── */}
            <CandidateHeader
                candidate={candidate}
                interview={interview}
                questionCount={questionBreakdown.length}
            />

            {/* ── 2. Tab Navigation ── */}
            <div className="flex gap-8 border-b border-[var(--color-border-subtle)] overflow-x-auto mb-4">
                <button
                    onClick={() => setActiveTab('evaluation')}
                    className={`px-4 py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                        activeTab === 'evaluation'
                            ? 'border-[var(--color-accent-violet)] text-[var(--color-accent-violet)]'
                            : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                    }`}
                >
                    Evaluation
                </button>
                <button
                    onClick={() => setActiveTab('session-details')}
                    className={`px-4 py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                        activeTab === 'session-details'
                            ? 'border-[var(--color-accent-violet)] text-[var(--color-accent-violet)]'
                            : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                    }`}
                >
                    Session Details
                </button>
            </div>

            {/* ── 3. Tab Content: Evaluation ── */}
            {activeTab === 'evaluation' && (
                <div className="flex flex-col gap-10 animate-fade-in-up">
                    <section>
                        <SectionHeader
                            title="Performance Analytics"
                            subtitle="AI-generated evaluation scores and hiring recommendation"
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                            <ResultSummaryCard summary={summary} evaluation={evaluation} />
                            <RadarChartCard scores={charts} />
                            <ProgressScoreCard scores={charts} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <StrengthsCard strengths={summary.strengths} />
                            <WeaknessesCard weaknesses={summary.weaknesses} />
                        </div>
                    </section>
                    
                    <section>
                        <SectionHeader
                            title="Question Breakdown"
                            subtitle="Per-question scores and AI feedback"
                        />
                        <QuestionBreakdownAccordion questionEvaluations={questionBreakdown} />
                    </section>
                </div>
            )}

            {/* ── 4. Tab Content: Session Details ── */}
            {activeTab === 'session-details' && (
                <div className="flex flex-col gap-10 animate-fade-in-up">
                    <section>
                        <SectionHeader
                            title="Session Replay"
                            subtitle="Video recording with question and violation markers"
                        />
                        <div className="surface p-5">
                            <ReplayWidget />
                        </div>
                    </section>

                    <section>
                        <SectionHeader
                            title="Interview Transcript"
                            subtitle="Questions and answers — click any entry to seek to that moment"
                        />
                        <div className="surface p-5">
                            <TranscriptPanel />
                        </div>
                    </section>

                    <section>
                        <SectionHeader
                            title="Interview Warnings"
                            subtitle="Integrity violations — click any warning to seek the video"
                        />
                        <WarningsTimeline />
                    </section>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .candidate-workspace > section > div[style*="grid-template-columns: repeat(3"] {
                        grid-template-columns: 1fr !important;
                    }
                    .candidate-workspace > section > div[style*="grid-template-columns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};



