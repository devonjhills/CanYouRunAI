"use client";

import React from "react";
import { LLMModel } from "@/app/data/llm-models";
import { Cpu, MemoryStick, MonitorCog, HardDrive } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ModelSelect } from "@/app/components/ModelSelect";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export interface SystemInfo {
  CPU: string;
  RAM: string;
  GPU: string;
  VRAM: string;
  Storage: string;
  GPUBandwidth?: number;
  GPUDetails?: {
    codeName?: string;
    busInterface?: string;
    memoryBusType?: string;
    memoryBusWidth?: string;
    tdp?: string;
    process?: string;
    baseCoreClock?: string;
    boostCoreClock?: string;
  };
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

export const SystemChecker = ({
  systemInfo,
  comparisonModel,
  models,
  onModelSelect,
  lastChecked,
}: SystemCheckerProps) => {
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
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">System Requirements Check</h2>
            <p className="text-muted-foreground">
              Last checked:{" "}
              {lastChecked
                ? new Date(lastChecked).toLocaleString(undefined, {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never"}
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Select a model to compare your hardware against:
            </p>
            <ModelSelect
              models={models}
              selectedModelId={comparisonModel?.id}
              onModelSelect={onModelSelect}
              className="min-w-[200px]"
            />
          </div>
        </div>

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
                <div className="w-full">
                  <span className="text-sm text-muted-foreground">GPU:</span>
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full group">
                      <p className="text-sm font-medium group-hover:text-primary">
                        {systemInfo?.GPU || "Not specified"}
                      </p>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2 border rounded-md p-3 bg-muted/30">
                      <div className="text-sm space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">VRAM:</span>
                          <span>{systemInfo?.VRAM || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Memory Bandwidth:
                          </span>
                          <span>
                            {systemInfo?.GPUBandwidth
                              ? `${systemInfo.GPUBandwidth} GB/s`
                              : "N/A"}
                          </span>
                        </div>
                        {systemInfo?.GPUDetails && (
                          <>
                            <div className="my-2 border-t border-border/50" />
                            {Object.entries({
                              "Code Name": systemInfo.GPUDetails.codeName,
                              "Bus Interface":
                                systemInfo.GPUDetails.busInterface,
                              "Memory Type":
                                systemInfo.GPUDetails.memoryBusType,
                              "Memory Bus Width":
                                systemInfo.GPUDetails.memoryBusWidth,
                              TDP: systemInfo.GPUDetails.tdp,
                              "Process Node": systemInfo.GPUDetails.process,
                              "Base Clock": systemInfo.GPUDetails.baseCoreClock,
                              "Boost Clock":
                                systemInfo.GPUDetails.boostCoreClock,
                            }).map(([label, value]) =>
                              value ? (
                                <div
                                  key={label}
                                  className="flex justify-between"
                                >
                                  <span className="text-muted-foreground">
                                    {label}:
                                  </span>
                                  <span>{value}</span>
                                </div>
                              ) : null,
                            )}
                          </>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </div>
          </div>
        </Card>

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
};
