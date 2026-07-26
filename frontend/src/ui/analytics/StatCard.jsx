import React from "react";
import { Card, CardContent } from "../components/Card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../utils/cn";

export default function StatCard({ 
  title, 
  value, 
  trend, 
  trendLabel, 
  icon: Icon,
  className 
}) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {value}
            </p>
          </div>
          {Icon && (
            <div className="rounded-xl bg-[var(--background-secondary)] p-2.5 text-[var(--text-secondary)]">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        
        {typeof trend !== 'undefined' && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={cn(
                "flex items-center text-sm font-medium",
                isPositive && "text-[var(--color-success)]",
                isNegative && "text-[var(--color-danger)]",
                !isPositive && !isNegative && "text-[var(--text-muted)]"
              )}
            >
              {isPositive && <TrendingUp className="mr-1 h-4 w-4" />}
              {isNegative && <TrendingDown className="mr-1 h-4 w-4" />}
              {!isPositive && !isNegative && <Minus className="mr-1 h-4 w-4" />}
              {Math.abs(trend)}%
            </span>
            {trendLabel && (
              <span className="text-sm text-[var(--text-muted)]">
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
