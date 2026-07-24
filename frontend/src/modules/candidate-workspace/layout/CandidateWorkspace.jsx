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

import { CandidateStatusWidget } from '../widgets/CandidateStatusWidget.jsx';
import { ReplayWidget } from '../widgets/ReplayWidget.jsx';
import { TranscriptWidget } from '../widgets/TranscriptWidget.jsx';
import { ViolationWidget } from '../widgets/ViolationWidget.jsx';
import { HiringActionsWidget } from '../widgets/HiringActionsWidget.jsx';
import { EmployerNotesWidget } from '../widgets/EmployerNotesWidget.jsx';
import { EvaluationWidget } from '../../evaluation-engine/index.js';

export const CandidateWorkspace = ({ resultData }) => {
    const { state, actions } = useCandidateReview();

    useEffect(() => {
        if (resultData) {
            actions.loadSession(resultData);
        }
    }, [resultData, actions]);

    if (!resultData) return null;

    if (state === REVIEW_STATES.LOADING) {
        return <div className="workspace-loading" style={{ padding: '40px', textAlign: 'center' }}>Loading Candidate Workspace...</div>;
    }

    if (state === REVIEW_STATES.ERROR) {
        return <div className="workspace-error" style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Failed to load candidate data.</div>;
    }

    const { candidate, interview, summary, evaluation, charts, questionBreakdown } = resultData;

    return (
        <div className="candidate-workspace max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    <CandidateHeader candidate={candidate} interview={interview} questionCount={questionBreakdown.length} />
                </div>
                <div style={{ minWidth: '300px', marginLeft: '20px' }}>
                    <CandidateStatusWidget />
                </div>
            </div>

            <div className="workspace-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
                
                {/* Main Content Column */}
                <div className="main-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Top Row: Replay & Transcript */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="xl:col-span-1">
                            <h3 className="text-lg font-bold text-white mb-4 pl-2 border-l-4 border-primary-500">Session Replay</h3>
                            <ReplayWidget />
                        </div>
                        <div className="xl:col-span-1">
                            <h3 className="text-lg font-bold text-white mb-4 pl-2 border-l-4 border-primary-500">Transcript</h3>
                            <TranscriptWidget />
                        </div>
                    </div>
                    
                    <div>
                        <EvaluationWidget session={resultData} />
                    </div>
                    
                    {/* Analytics Row */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 pl-2 border-l-4 border-primary-500">Performance Analytics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <ResultSummaryCard summary={summary} evaluation={evaluation} />
                            </div>
                            <div className="md:col-span-1">
                                <RadarChartCard scores={charts} />
                            </div>
                            <div className="md:col-span-1">
                                <ProgressScoreCard scores={charts} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StrengthsCard strengths={summary.strengths} />
                        <WeaknessesCard weaknesses={summary.weaknesses} />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 pl-2 border-l-4 border-primary-500">Question Breakdown</h3>
                        <QuestionBreakdownAccordion questionEvaluations={questionBreakdown} />
                    </div>
                </div>
                
                {/* Context & Actions Sidebar Column */}
                <div className="sidebar-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <HiringActionsWidget />
                    <EmployerNotesWidget />
                    <ViolationWidget />
                </div>
            </div>
            
            <style>{`
                @media (max-width: 1024px) {
                    .workspace-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};
