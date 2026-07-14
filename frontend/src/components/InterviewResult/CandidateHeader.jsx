import { User, Briefcase, Mail, Calendar, HelpCircle } from "lucide-react";

export default function CandidateHeader({ candidate, interview, questionCount }) {
  const formattedDate = new Date(interview.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/20 shrink-0">
          {candidate.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{candidate.name}</h1>
          <div className="flex items-center gap-2 text-dark-300 mt-1">
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>{candidate.email}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start md:items-end gap-1.5">
        <h2 className="text-lg font-semibold text-white">{interview.title}</h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-primary-400 text-sm font-medium">
          <span className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
            {interview.jobRole}
          </span>
          <span className="text-dark-500 hidden md:inline">•</span>
          <span>{interview.experienceLevel}</span>
          <span className="text-dark-500 hidden md:inline">•</span>
          <span className="flex items-center gap-1 text-dark-300">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            {formattedDate}
          </span>
          <span className="text-dark-500 hidden md:inline">•</span>
          <span className="flex items-center gap-1 text-dark-300">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {questionCount} Questions
          </span>
        </div>
      </div>
    </div>
  );
}
