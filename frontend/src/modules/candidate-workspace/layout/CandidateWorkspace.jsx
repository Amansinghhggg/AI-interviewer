import React, { useEffect } from 'react';
import { useCandidateReview } from '../hooks/useCandidateReview.js';
import { REVIEW_STATES } from '../config/constants.js';

import CandidateHeader from '../../../components/InterviewResult/CandidateHeader';
import ResultSummaryCard from '../../../components/InterviewResult/ResultSummaryCard';
import RadarChartCard from '../../../components/InterviewResult/RadarChartCard';
import ProgressScoreCard from '../../../components/InterviewResult/ProgressScoreCard';
import StrengthsCard from '../../../components/InterviewResult/StrengthsCard';
import WeaknessesCard from '../../../components/InterviewResult/WeaknessesCard';
import QuestionBreakdownAccordion from '../../../components/InterviewResult/QuestionBreakdownAccordion';

import { ReplayWidget } from '../widgets/ReplayWidget.jsx';
import { WarningsTimeline, TranscriptPanel } from '../../replay/index.js';

// ─── Section Header ─────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '16px' }}>
        <h3 style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 700,
            color: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        }}>
            <span style={{
                display: 'inline-block',
                width: '3px',
                height: '18px',
                borderRadius: '2px',
                background: 'linear-gradient(180deg, #7c3aed, #a855f7)',
                flexShrink: 0,
            }} />
            {title}
        </h3>
        {subtitle && (
            <p style={{ margin: '4px 0 0 13px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                {subtitle}
            </p>
        )}
    </div>
);

export const CandidateWorkspace = ({ resultData }) => {
    const { state, actions } = useCandidateReview();

    useEffect(() => {
        if (resultData) {
            actions.loadSession(resultData);
        }
    }, [resultData, actions]);

    if (!resultData) return null;

    if (state === REVIEW_STATES.LOADING) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                Loading Candidate Workspace...
            </div>
        );
    }

    if (state === REVIEW_STATES.ERROR) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>
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
                gap: '40px',
            }}
        >
            {/* ── 1. Candidate Header ── */}
            <CandidateHeader
                candidate={candidate}
                interview={interview}
                questionCount={questionBreakdown.length}
            />

            {/* ── 2. Performance Analytics ── */}
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

            {/* ── 3. Session Replay ── */}
            <section>
                <SectionHeader
                    title="Session Replay"
                    subtitle="Video recording with question and violation markers"
                />
                <div style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}>
                    <ReplayWidget />
                </div>
            </section>

            {/* ── 4. Transcript ── */}
            <section>
                <SectionHeader
                    title="Interview Transcript"
                    subtitle="Questions and answers — click any entry to seek to that moment"
                />
                <div style={{
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '20px',
                }}>
                    <TranscriptPanel />
                </div>
            </section>

            {/* ── 5. Warnings Timeline ── */}
            <section>
                <SectionHeader
                    title="Interview Warnings"
                    subtitle="Integrity violations — click any warning to seek the video"
                />
                <WarningsTimeline />
            </section>

            {/* ── 6. Question Breakdown ── */}
            <section>
                <SectionHeader
                    title="Question Breakdown"
                    subtitle="Per-question scores and AI feedback"
                />
                <QuestionBreakdownAccordion questionEvaluations={questionBreakdown} />
            </section>

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


