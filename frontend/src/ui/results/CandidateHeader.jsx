import { User, Briefcase, Mail, Calendar, HelpCircle } from "lucide-react";
import { Card, CardContent } from "../components/Card";

export default function CandidateHeader({ candidate, interview, questionCount }) {
  const formattedDate = new Date(interview.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Card>
      <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[var(--primary)]/20 shrink-0">
            {candidate.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{candidate.name}</h1>
            <div className="flex items-center gap-2 text-[var(--text-secondary)] mt-1">
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>{candidate.email}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1.5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{interview.title}</h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--primary)] text-sm font-medium">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
              {interview.jobRole}
            </span>
            <span className="text-[var(--text-secondary)] hidden md:inline">•</span>
            <span>{interview.experienceLevel}</span>
            <span className="text-[var(--text-secondary)] hidden md:inline">•</span>
            <span className="flex items-center gap-1 text-[var(--text-secondary)]">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {formattedDate}
            </span>
            <span className="text-[var(--text-secondary)] hidden md:inline">•</span>
            <span className="flex items-center gap-1 text-[var(--text-secondary)]">
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              {questionCount} Questions
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
