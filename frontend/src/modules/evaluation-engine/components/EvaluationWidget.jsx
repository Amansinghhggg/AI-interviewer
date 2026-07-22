import React from 'react';
import { useEvaluationEngine } from '../hooks/useEvaluationEngine.js';

export const EvaluationWidget = ({ session }) => {
    const { evaluation, loading, error, regenerate } = useEvaluationEngine(session);

    if (loading) {
        return (
            <div className="widget ai-evaluation-widget" style={{ padding: '40px 20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                Generating AI Evaluation...
            </div>
        );
    }

    if (error || !evaluation) {
        return (
            <div className="widget ai-evaluation-widget" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', color: 'red' }}>
                Failed to generate evaluation. <button onClick={regenerate} style={{ marginLeft: '10px' }}>Retry</button>
            </div>
        );
    }

    return (
        <div className="widget ai-evaluation-widget" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>AI Evaluation</h3>
                <button onClick={regenerate} style={{ padding: '6px 12px', fontSize: '0.85em', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }}>Regenerate</button>
            </div>
            
            <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' }}>
                <h2 style={{ margin: 0, color: '#2e7d32' }}>{evaluation.recommendation}</h2>
                <div style={{ fontSize: '0.9em', color: '#555', marginTop: '5px' }}>
                    Score: {evaluation.overallScore}/100 | Confidence: {Math.round(evaluation.confidence * 100)}%
                </div>
            </div>

            <p style={{ lineHeight: '1.6', color: '#444' }}>{evaluation.summary}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div>
                    <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Strengths</h4>
                    <ul style={{ paddingLeft: '20px', color: '#2e7d32', margin: 0 }}>
                        {evaluation.strengths.map((s, i) => <li key={i} style={{ marginBottom: '5px' }}>{s}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Weaknesses</h4>
                    <ul style={{ paddingLeft: '20px', color: '#c62828', margin: 0 }}>
                        {evaluation.weaknesses.map((w, i) => <li key={i} style={{ marginBottom: '5px' }}>{w}</li>)}
                    </ul>
                </div>
            </div>

            <div style={{ marginTop: '25px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Category Scores</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.entries(evaluation.categoryScores).map(([category, score]) => (
                        <div key={category} style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', flex: '1 1 100px', textAlign: 'center', border: '1px solid #eee' }}>
                            <div style={{ fontSize: '0.75em', textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px', marginBottom: '5px' }}>{category}</div>
                            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#333' }}>{score}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
