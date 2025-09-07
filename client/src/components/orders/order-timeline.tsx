import React from 'react';
import { CheckCircle } from 'lucide-react';

export interface TimelineStep {
  status: string;
  title: string;
  description: string;
  timestamp: string | null;
  completed: boolean;
}

interface OrderTimelineProps {
  timeline: TimelineStep[];
  className?: string;
  compact?: boolean;
}

export function OrderTimeline({ timeline, className = '', compact = false }: OrderTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: compact ? 'short' : 'long',
      year: 'numeric',
      month: compact ? 'short' : 'long',
      day: 'numeric',
      ...(compact ? {} : { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div className={`space-y-${compact ? '3' : '4'} ${className}`}>
      {timeline.map((step, index) => (
        <div key={step.status} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full flex items-center justify-center ${
              step.completed 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {step.completed ? (
                <CheckCircle className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
              ) : (
                <div className={`${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-current`} />
              )}
            </div>
            {index < timeline.length - 1 && (
              <div className={`w-px ${compact ? 'h-6' : 'h-8'} ${
                step.completed ? 'bg-green-200' : 'bg-border'
              } mt-2`} />
            )}
          </div>
          <div className={`flex-1 ${compact ? 'pb-3' : 'pb-4'}`}>
            <h4 className={`font-medium ${compact ? 'text-sm' : 'text-base'} ${
              step.completed ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step.title}
            </h4>
            {!compact && (
              <p className="text-sm text-muted-foreground">{step.description}</p>
            )}
            {step.timestamp && (
              <p className={`${compact ? 'text-xs' : 'text-xs'} text-muted-foreground ${compact ? '' : 'mt-1'}`}>
                {formatDate(step.timestamp)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}