import { useState } from "react";
import { ChevronDown, MessageSquare, Terminal, Hash, Target } from "lucide-react";

export default function QuestionBreakdownAccordion({ questionEvaluations }) {
  if (!questionEvaluations || questionEvaluations.length === 0) return null;

  return (
    <div className="space-y-4">
      {questionEvaluations.map((qe, index) => (
        <QuestionCard key={index} qe={qe} index={index + 1} />
      ))}
    </div>
  );
}

function QuestionCard({ qe, index }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `question-panel-${index}`;
  const buttonId = `question-btn-${index}`;

  return (
    <div className="bg-[var(--color-surface-variant)] rounded-xl border border-[var(--color-outline-variant)] overflow-hidden shadow-sm">
      <button 
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-5 flex items-start justify-between hover:bg-[var(--color-surface-variant)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
      >
        <div className="flex gap-4 pr-4 w-full">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] flex items-center justify-center font-bold text-sm">
            {index}
          </div>
          <div className="flex-1">
            <h4 className="text-[var(--color-on-surface)] font-medium line-clamp-2 md:line-clamp-none leading-relaxed">{qe.question}</h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-[var(--color-on-surface-variant)]">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-[var(--color-surface-variant)] rounded-md">
                <Hash className="w-3 h-3 text-[var(--color-on-surface-variant)]" aria-hidden="true" />
                Topic: <strong className="text-[var(--color-on-surface-variant)]">{qe.topic}</strong>
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-[var(--color-surface-variant)] rounded-md">
                <Target className="w-3 h-3 text-[var(--color-on-surface-variant)]" aria-hidden="true" />
                Diff: <strong className="text-[var(--color-on-surface-variant)]">{qe.difficulty}</strong>
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-primary-900/10 rounded-md">
                <Terminal className="w-3.5 h-3.5 text-primary-500" aria-hidden="true" />
                Tech: <strong className="text-primary-400">{qe.scores.technical}/10</strong>
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-900/10 rounded-md">
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
                Comm: <strong className="text-blue-400">{qe.scores.communication}/10</strong>
              </span>
            </div>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-[var(--color-on-surface-variant)] shrink-0 transition-transform duration-300 mt-1 ${isOpen ? "rotate-180" : ""}`} 
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div id={panelId} role="region" aria-labelledby={buttonId} className="p-5 pt-0 border-t border-[var(--color-outline-variant)] mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            <div>
              <h5 className="text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2">Candidate's Answer</h5>
              <div className="bg-[var(--color-surface-variant)] rounded-lg p-4 text-sm text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)] min-h-[100px] whitespace-pre-wrap">
                {qe.answer || <span className="text-[var(--color-on-surface-variant)] italic">No answer provided.</span>}
              </div>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 text-primary-400">AI Feedback</h5>
              <div className="bg-primary-900/10 rounded-lg p-4 text-sm text-[var(--color-on-surface-variant)] border border-primary-900/30 min-h-[100px] whitespace-pre-wrap">
                {qe.feedback}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
