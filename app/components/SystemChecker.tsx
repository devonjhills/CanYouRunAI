"use client";

import React from "react";
import { LLMModel } from "@/app/data/llm-models";

export interface SystemInfo {
  CPU: string;
  RAM: string;
  GPU: string;
  VRAM: string;
  OS: string;
}

interface SystemCheckerProps {
  systemInfo?: SystemInfo;
  selectedModel?: LLMModel;
}

export const SystemChecker = ({ systemInfo, selectedModel }: SystemCheckerProps) => {
  if (!systemInfo || !selectedModel) {
    return (
      <div className="neo-card mb-8 p-6">
        <p className="text-muted-foreground text-center">
          Download and run the system checker to see your results
        </p>
      </div>
    );
  }

  const getComparisonStatus = (type: 'CPU' | 'RAM' | 'GPU' | 'VRAM') => {
    // This is a simple comparison - you might want to make this more sophisticated
    switch (type) {
      case 'RAM':
        const userRam = parseFloat(systemInfo.RAM);
        const reqRam = parseFloat(selectedModel.requirements.ram.split('GB')[0]);
        if (userRam >= reqRam * 1.5) return "✓";
        if (userRam >= reqRam) return "⚠";
        return "✗";
      case 'VRAM':
        const userVram = parseFloat(systemInfo.VRAM);
        const reqVram = selectedModel.requirements.gpu.includes('GB') 
          ? parseFloat(selectedModel.requirements.gpu.split('GB')[0])
          : 0;
        if (userVram >= reqVram) return "✓";
        if (userVram >= reqVram * 0.75) return "⚠";
        return "✗";
      default:
        return "ℹ";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "✓": return "border-green-500";
      case "⚠": return "border-yellow-500";
      case "✗": return "border-red-500";
      default: return "border-blue-500";
    }
  };

  return (
    <div className="neo-card mb-8 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your System */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Your System</h3>
          <div className="space-y-3">
            {Object.entries(systemInfo).map(([key, value]) => (
              <div 
                key={key}
                className={`neo-brutalist-shadow-sm p-4 border-4 ${getStatusColor(getComparisonStatus(key as any))}`}
              >
                <h4 className="font-bold text-foreground">{key}</h4>
                <p className="text-muted-foreground">{value}</p>
                <p className="font-medium">
                  {getComparisonStatus(key as any)} {" "}
                  {key === 'RAM' && getComparisonStatus('RAM') === "⚠" && "Minimum requirements met"}
                  {key === 'RAM' && getComparisonStatus('RAM') === "✓" && "Exceeds requirements"}
                  {key === 'RAM' && getComparisonStatus('RAM') === "✗" && "Below requirements"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Model Requirements */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">{selectedModel.name} Requirements</h3>
          <div className="space-y-3">
            <div className="neo-brutalist-shadow-sm p-4 border-4 border-primary/30">
              <h4 className="font-bold">CPU</h4>
              <p className="text-muted-foreground">{selectedModel.requirements.cpu}</p>
            </div>
            <div className="neo-brutalist-shadow-sm p-4 border-4 border-primary/30">
              <h4 className="font-bold">RAM</h4>
              <p className="text-muted-foreground">{selectedModel.requirements.ram}</p>
            </div>
            <div className="neo-brutalist-shadow-sm p-4 border-4 border-primary/30">
              <h4 className="font-bold">GPU</h4>
              <p className="text-muted-foreground">{selectedModel.requirements.gpu}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-bold mb-2">Notes</h4>
        <p className="text-muted-foreground">{selectedModel.requirements.notes}</p>
      </div>
    </div>
  );
};
