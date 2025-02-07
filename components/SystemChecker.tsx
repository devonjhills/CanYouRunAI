"use client";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  comparisonModel?: LLMModel;
  models: LLMModel[];
  onModelSelect: (id: string) => void;
}

export function SystemChecker({
  systemInfo,
  comparisonModel,
  models,
  onModelSelect,
}: SystemCheckerProps) {
  return (
    <Card className="neo-brutalist-box border-[3px]">
      <div className="p-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">System Requirements Check</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compare your system specifications against the requirements for running different AI models
          </p>
        </div>

        {/* System Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Your System */}
          <div className="rounded-xl overflow-hidden border-2 border-foreground">
            <div className="bg-primary/20 p-4 border-b-2 border-foreground">
              <h3 className="text-lg font-semibold">Your System</h3>
            </div>
            <div className="p-6 bg-background space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>RAM:</span>
                  <span className="font-mono">{systemInfo?.RAM ?? "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>GPU:</span>
                  <span className="font-mono">{systemInfo?.GPU ?? "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>VRAM:</span>
                  <span className="font-mono">{systemInfo?.VRAM ?? "Unknown"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Requirements */}
          <div className="rounded-xl overflow-hidden border-2 border-foreground">
            <div className="bg-secondary/20 p-4 border-b-2 border-foreground">
              <h3 className="text-lg font-semibold">Model Requirements</h3>
            </div>
            <div className="p-6 bg-background space-y-4">
              <Select
                value={comparisonModel?.id}
                onValueChange={(id) => onModelSelect(id)}
              >
                <SelectTrigger className="neo-input w-full">
                  <SelectValue placeholder="Select a model to compare" />
                </SelectTrigger>
                <SelectContent className="neo-brutalist-box border-2">
                  {models.map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      className="focus:bg-accent/20"
                    >
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {comparisonModel && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Required RAM:</span>
                    <span className="font-mono">{comparisonModel.requiredRAM}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Required VRAM:</span>
                    <span className="font-mono">{comparisonModel.requiredVRAM}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Recommended GPU:</span>
                    <span className="font-mono">{comparisonModel.recommendedGPU}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 