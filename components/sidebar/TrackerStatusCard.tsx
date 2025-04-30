"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Signal strength icon component
const SignalIcon: React.FC<{ strength: number }> = ({ strength }) => {
  // Signal strength should be between 0-4
  const bars = [
    { height: "h-2", opacity: strength >= 1 ? "opacity-100" : "opacity-30" },
    { height: "h-3", opacity: strength >= 2 ? "opacity-100" : "opacity-30" },
    { height: "h-4", opacity: strength >= 3 ? "opacity-100" : "opacity-30" },
    { height: "h-5", opacity: strength >= 4 ? "opacity-100" : "opacity-30" },
  ];

  return (
    <div className="flex items-end gap-0.5">
      {bars.map((bar, index) => (
        <div 
          key={`signal-bar-${index}`}
          className={cn(
            "w-1 bg-emerald-500 rounded-sm",
            bar.height,
            bar.opacity
          )}
        />
      ))}
    </div>
  );
};

interface TrackerStatusCardProps {
  activeCount: number;
  totalCount: number;
  signalStrength?: number; // 0-4
  className?: string;
}

const TrackerStatusCard: React.FC<TrackerStatusCardProps> = ({
  activeCount,
  totalCount,
  signalStrength = 4,
  className
}) => {
  const offlineCount = totalCount - activeCount;
  const activePercentage = (activeCount / totalCount) * 100;

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-gray-700 font-medium text-lg">Active Trackers</h3>
          <SignalIcon strength={signalStrength} />
        </div>

        <div className="mt-2">
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold text-gray-900">{activeCount}/{totalCount}</span>
          </div>
          <p className="text-gray-500 mt-1">{offlineCount} devices offline</p>
        </div>

        {/* Custom progress bar implementation */}
        <div className="h-2 mt-4 bg-emerald-100 w-full rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500"
            style={{ width: `${activePercentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackerStatusCard;