import React, { useEffect } from 'react';
import { useCandidateReview } from '../hooks/useCandidateReview.js';
import { REVIEW_STATES } from '../config/constants.js';

import { CandidateCard } from '../widgets/CandidateCard.jsx';
import { CandidateStatusWidget } from '../widgets/CandidateStatusWidget.jsx';
import { InterviewOverviewWidget } from '../widgets/InterviewOverviewWidget.jsx';
import { ReplayWidget } from '../widgets/ReplayWidget.jsx';
import { TranscriptWidget } from '../widgets/TranscriptWidget.jsx';
import { ViolationWidget } from '../widgets/ViolationWidget.jsx';
import { HiringActionsWidget } from '../widgets/HiringActionsWidget.jsx';
import { EmployerNotesWidget } from '../widgets/EmployerNotesWidget.jsx';
import { EvaluationWidget } from '../../evaluation-engine/index.js';

export const CandidateWorkspace = ({ session }) => {
    const { state, actions } = useCandidateReview();

    useEffect(() => {
        if (session) {
            actions.loadSession(session);
        }
    }, [session, actions]);

    if (state === REVIEW_STATES.LOADING) {
        return <div className="workspace-loading" style={{ padding: '40px', textAlign: 'center' }}>Loading Candidate Workspace...</div>;
    }

    if (state === REVIEW_STATES.ERROR) {
        return <div className="workspace-error" style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Failed to load candidate data.</div>;
    }

    return (
        <div className="candidate-workspace" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Candidate Workspace</h1>
                <div style={{ minWidth: '300px' }}>
                    <CandidateStatusWidget />
                </div>
            </div>

            <InterviewOverviewWidget />

            <div className="workspace-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
                
                {/* Main Content Column */}
                <div className="main-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <CandidateCard />
                    <ReplayWidget />
                    <EvaluationWidget session={session} />
                </div>
                
                {/* Context & Actions Sidebar Column */}
                <div className="sidebar-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <HiringActionsWidget />
                    <EmployerNotesWidget />
                    <ViolationWidget />
                    <TranscriptWidget />
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
