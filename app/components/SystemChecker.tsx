"use client";

import React from "react";
import { LLMModel } from "@/app/data/llm-models";
import { Cpu, MemoryStick, MonitorCog, HardDrive } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ModelSelect } from "@/app/components/ModelSelect";

export interface SystemInfo {
  CPU: string;
  RAM: string;
  GPU: string;
  VRAM: string;
  Storage: string;
}

interface SystemCheckerProps {
  systemInfo?: SystemInfo;
  comparisonModel?: LLMModel;
  models: LLMModel[];
  onModelSelect: (modelId: string) => void;
  lastChecked?: string | null;
  onSystemInfoUpdate?: (info: SystemInfo) => void;
}

function compareRAMorVRAM(actual: string, required: string): boolean {
  if (actual === "Unknown") return false;
  const actualGB = parseFloat(actual.split(" ")[0]);
  const requiredGB = parseFloat(required.split(" ")[0]);
  return actualGB >= requiredGB;
}

export function SystemChecker({
  systemInfo,
  comparisonModel,
  models,
  onModelSelect,
  lastChecked,
}: SystemCheckerProps) {
  const comparisonSpecs = [
    {
      icon: <MemoryStick className="w-5 h-5 text-primary" />,
      label: "RAM",
      value: systemInfo?.RAM || "Unknown",
      isValid:
        systemInfo?.RAM &&
        comparisonModel?.requirements.RAM &&
        compareRAMorVRAM(systemInfo.RAM, comparisonModel.requirements.RAM),
      requirement: comparisonModel?.requirements.RAM || "N/A",
    },
    {
      icon: <MemoryStick className="w-5 h-5 text-primary" />,
      label: "VRAM",
      value: systemInfo?.VRAM || "Unknown",
      isValid:
        systemInfo?.VRAM &&
        comparisonModel?.requirements.VRAM &&
        compareRAMorVRAM(systemInfo.VRAM, comparisonModel.requirements.VRAM),
      requirement: comparisonModel?.requirements.VRAM || "N/A",
    },
    {
      icon: <HardDrive className="w-5 h-5 text-primary" />,
      label: "Storage",
      value: systemInfo?.Storage || "Unknown",
      isValid: systemInfo?.Storage !== "Unknown",
      requirement: comparisonModel?.requirements.Storage || "N/A",
    },
  ];

  return (
    <Card
      className="w-full overflow-hidden h-full border-2"
      id="system-requirements"
    >
      <div className="border-b bg-background px-6 py-4">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
          System Requirements Check
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-muted/30">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">My Computer Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-sm text-muted-foreground">CPU:</span>
                  <p className="text-sm font-medium">
                    {systemInfo?.CPU || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MonitorCog className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-sm text-muted-foreground">GPU:</span>
                  <p className="text-sm font-medium">
                    {systemInfo?.GPU || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
            {lastChecked && (
              <p className="text-xs text-muted-foreground mt-3">
                Last entered: {new Date(lastChecked).toLocaleString()}
              </p>
            )}
          </div>
        </Card>

        <div className="flex justify-end">
          <ModelSelect
            models={models}
            selectedModelId={comparisonModel?.id}
            onModelSelect={onModelSelect}
          />
        </div>

        <div className="space-y-3">
          {comparisonSpecs.map((spec) => (
            <div key={spec.label} className="flex gap-4">
              <div
                className={`flex-1 flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                  spec.isValid
                    ? "bg-green-500/5 border-green-500/30 hover:border-green-500/50"
                    : "bg-red-500/5 border-red-500/30 hover:border-red-500/50"
                }`}
              >
                {spec.icon}
                <span className="text-muted-foreground font-medium">
                  {spec.label}:
                </span>
                <span
                  className={`font-semibold ${
                    spec.isValid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {spec.value}
                </span>
              </div>
              <div
                className={`flex-1 flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                  spec.isValid
                    ? "bg-green-500/5 border-green-500/30 hover:border-green-500/50"
                    : "bg-red-500/5 border-red-500/30 hover:border-red-500/50"
                }`}
              >
                {spec.icon}
                <span className="text-muted-foreground font-medium">
                  {spec.label}:
                </span>
                <span className="font-semibold text-foreground">
                  {spec.requirement}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
