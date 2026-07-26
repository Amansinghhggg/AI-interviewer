import { useState } from "react";
import { ChevronDown, MessageSquare, Terminal, Hash, Target } from "lucide-react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";

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
    <Card className="overflow-hidden">
      <button 
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-5 flex items-start justify-between hover:bg-[var(--background-secondary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset"
      >
        <div className="flex gap-4 pr-4 w-full">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--text-primary)] flex items-center justify-center font-bold text-sm">
            {index}
          </div>
          <div className="flex-1">
            <h4 className="text-[var(--text-primary)] font-semibold line-clamp-2 md:line-clamp-none leading-relaxed">{qe.question}</h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
              <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-1 bg-[var(--background-secondary)] border-[var(--border)] text-[var(--text-secondary)]">
                <Hash className="w-3 h-3" aria-hidden="true" />
                Topic: <strong className="text-[var(--text-primary)]">{qe.topic}</strong>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-1 bg-[var(--background-secondary)] border-[var(--border)] text-[var(--text-secondary)]">
                <Target className="w-3 h-3" aria-hidden="true" />
                Diff: <strong className="text-[var(--text-primary)]">{qe.difficulty}</strong>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20">
                <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                Tech: <strong>{qe.scores.technical}/10</strong>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-1 bg-[var(--color-info)]/10 text-[var(--color-info)] border-[var(--color-info)]/20">
                <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                Comm: <strong>{qe.scores.communication}/10</strong>
              </Badge>
            </div>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-[var(--text-secondary)] shrink-0 transition-transform duration-300 mt-1 ${isOpen ? "rotate-180" : ""}`} 
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div id={panelId} role="region" aria-labelledby={buttonId} className="p-5 pt-0 border-t border-[var(--border)] mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            <div>
              <h5 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Candidate's Answer</h5>
              <div className="bg-[var(--background-secondary)] rounded-lg p-4 text-sm text-[var(--text-primary)] border border-[var(--border)] min-h-[100px] whitespace-pre-wrap">
                {qe.answer || <span className="text-[var(--text-secondary)] italic">No answer provided.</span>}
              </div>
            </div>
            <div>
              <h5 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-2">AI Feedback</h5>
              <div className="bg-[var(--primary)]/5 rounded-lg p-4 text-sm text-[var(--text-primary)] border border-[var(--primary)]/20 min-h-[100px] whitespace-pre-wrap">
                {qe.feedback}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
