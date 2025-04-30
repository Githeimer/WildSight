"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

interface AlertStatusCardProps {
  criticalCount: number;
  warningCount: number;
  className?: string;
}

const AlertStatusCard: React.FC<AlertStatusCardProps> = ({
  criticalCount,
  warningCount,
  className
}) => {
  const totalAlerts = criticalCount + warningCount;
  
  // Calculate the percentage of critical alerts for the progress bar
  const criticalPercentage = totalAlerts > 0 
    ? (criticalCount / totalAlerts) * 100 
    : 0;

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-gray-700 font-medium text-lg">Active Alerts</h3>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>

        <div className="mt-2">
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold text-gray-900">{totalAlerts}</span>
          </div>
          <p className="text-gray-500 mt-1">
            {criticalCount} critical, {warningCount} warning
          </p>
        </div>

        {/* Custom progress bar that doesn't rely on indicatorClassName */}
        <div 
          className="h-2 mt-4 w-full rounded-full overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to right, 
              #EF4444 0%, 
              #EF4444 ${criticalPercentage}%, 
              #F59E0B ${criticalPercentage}%, 
              #F59E0B 100%)`
          }}
        />
      </CardContent>
    </Card>
  );
};

export default AlertStatusCard;