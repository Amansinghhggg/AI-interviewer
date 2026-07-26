import React from "react";
import { cn } from "../../utils/cn";
import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";

export default function ActivityFeed({ activities, className }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-sm text-[var(--text-muted)] p-4 text-center">
        No recent activity.
      </div>
    );
  }

  const getIconForType = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />;
      case "error":
        return <XCircle className="h-5 w-5 text-[var(--color-danger)]" />;
      case "pending":
        return <Clock className="h-5 w-5 text-[var(--color-warning)]" />;
      default:
        return <Circle className="h-5 w-5 text-[var(--text-muted)]" />;
    }
  };

  return (
    <div className={cn("flow-root", className)}>
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-[var(--border)]"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative px-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background)] ring-8 ring-[var(--card)]">
                    {getIconForType(activity.type)}
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-1.5">
                  <div className="text-sm text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-primary)] mr-1">
                      {activity.user}
                    </span>
                    {activity.action}
                    {activity.target && (
                      <span className="font-medium text-[var(--text-primary)] ml-1">
                        {activity.target}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex text-xs text-[var(--text-muted)]">
                    <span>{activity.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
