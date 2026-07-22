import React, { useEffect } from 'react';
import { useEmployerReview } from '../hooks/useEmployerReview.js';
import { REVIEW_STATES } from '../config/constants.js';

import { CandidateCard } from '../widgets/CandidateCard.jsx';
import { ReplayWidget } from '../widgets/ReplayWidget.jsx';
import { TranscriptWidget } from '../widgets/TranscriptWidget.jsx';
import { ViolationWidget } from '../widgets/ViolationWidget.jsx';
import { StatisticsWidget } from '../widgets/StatisticsWidget.jsx';
import { HiringWidget } from '../widgets/HiringWidget.jsx';
import { EvaluationWidget } from '../../evaluation-engine/index.js';

export const EmployerReviewWorkspace = ({ session }) => {
    const { state, actions } = useEmployerReview();

    useEffect(() => {
        if (session) {
            actions.loadSession(session);
        }
    }, [session, actions]);

    if (state === REVIEW_STATES.LOADING) {
        return <div className="workspace-loading" style={{ padding: '40px', textAlign: 'center' }}>Loading Review Workspace...</div>;
    }

    if (state === REVIEW_STATES.ERROR) {
        return <div className="workspace-error" style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Failed to load session data.</div>;
    }

    return (
        <div className="employer-review-workspace" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
            <h1 style={{ marginBottom: '20px', color: '#333' }}>Employer Review</h1>
            <div className="workspace-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
                
                {/* Main Content Column */}
                <div className="main-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <CandidateCard />
                    <ReplayWidget />
                    <EvaluationWidget session={session} />
                </div>
                
                {/* Context Sidebar Column */}
                <div className="sidebar-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <HiringWidget />
                    <StatisticsWidget />
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
