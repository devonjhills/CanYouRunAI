"use client";

import React from "react";
import { LLMModel } from "@/app/data/llm-models";
import {
  MemoryStick,
  MonitorCog,
  HardDrive,
  LifeBuoy,
  ChevronDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ModelSelect } from "@/app/components/ModelSelect";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SystemInfo {
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

const SystemSpecItem = ({
  icon,
  label,
  value,
  tooltip,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip?: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-3 p-3 bg-muted/5 rounded-lg border">
          <span className="text-primary">{icon}</span>
          <div>
            <p className="text-sm font-medium text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </TooltipTrigger>
      {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
    </Tooltip>
  </TooltipProvider>
);

export const SystemChecker = ({
  systemInfo,
  comparisonModel,
  models,
  onModelSelect,
  lastChecked,
}: SystemCheckerProps) => {
  const comparisonSpecs = [
    {
      icon: <MemoryStick className="w-5 h-5" />,
      label: "RAM",
      value: systemInfo?.RAM || "Unknown",
      isValid:
        systemInfo?.RAM &&
        comparisonModel?.requirements.RAM &&
        compareRAMorVRAM(systemInfo.RAM, comparisonModel.requirements.RAM),
      requirement: comparisonModel?.requirements.RAM || "N/A",
    },
    {
      icon: <MemoryStick className="w-5 h-5" />,
      label: "VRAM",
      value: systemInfo?.VRAM || "Unknown",
      isValid:
        systemInfo?.VRAM &&
        comparisonModel?.requirements.VRAM &&
        compareRAMorVRAM(systemInfo.VRAM, comparisonModel.requirements.VRAM),
      requirement: comparisonModel?.requirements.VRAM || "N/A",
    },
    {
      icon: <HardDrive className="w-5 h-5" />,
      label: "Storage",
      value: systemInfo?.Storage || "Unknown",
      isValid: systemInfo?.Storage !== "Unknown",
      requirement: comparisonModel?.requirements.Storage || "N/A",
    },
  ];

  return (
    <Card className="p-6 space-y-6 backdrop-blur-sm bg-background/80">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              System Compatibility Check
            </h1>
            <p className="text-sm text-muted-foreground">
              Last system check:{" "}
              {lastChecked
                ? new Date(lastChecked).toLocaleDateString()
                : "Never"}
            </p>
          </div>
          <div className="flex flex-col gap-2 min-w-[300px]">
            <p className="text-sm text-muted-foreground">
              Compare against model:
            </p>
            <ModelSelect
              models={models}
              selectedModelId={comparisonModel?.id}
              onModelSelect={onModelSelect}
              placeholder="Select AI Model..."
            />
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* System Specifications */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Hardware Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <SystemSpecItem
              icon={<MemoryStick className="w-5 h-5" />}
              label="System RAM"
              value={systemInfo?.RAM || "Not detected"}
              tooltip="System Random Access Memory"
            />
            <SystemSpecItem
              icon={<MonitorCog className="w-5 h-5" />}
              label="GPU"
              value={systemInfo?.GPU || "Not detected"}
              tooltip="Graphics Processing Unit"
            />
            <SystemSpecItem
              icon={<MemoryStick className="w-5 h-5" />}
              label="VRAM"
              value={systemInfo?.VRAM || "Not detected"}
              tooltip="Video Random Access Memory"
            />
            <SystemSpecItem
              icon={<HardDrive className="w-5 h-5" />}
              label="Storage"
              value={systemInfo?.Storage || "Not detected"}
              tooltip="Storage Capacity"
            />
          </div>

          {/* GPU Details Collapsible */}
          {systemInfo?.GPUDetails && (
            <Collapsible className="bg-muted/5 rounded-lg border">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-2">
                  <MonitorCog className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">
                    Advanced GPU Details
                  </span>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {Object.entries({
                    Bandwidth: systemInfo.GPUBandwidth
                      ? `${systemInfo.GPUBandwidth} GB/s`
                      : "N/A",
                    "Code Name": systemInfo.GPUDetails.codeName,
                    "Memory Type": systemInfo.GPUDetails.memoryBusType,
                    "Bus Width": systemInfo.GPUDetails.memoryBusWidth,
                    TDP: systemInfo.GPUDetails.tdp,
                    "Process Node": systemInfo.GPUDetails.process,
                    "Base Clock": systemInfo.GPUDetails.baseCoreClock,
                    "Boost Clock": systemInfo.GPUDetails.boostCoreClock,
                  }).map(
                    ([label, value]) =>
                      value && (
                        <div key={label} className="space-y-1">
                          <p className="text-muted-foreground text-xs">
                            {label}
                          </p>
                          <p className="font-medium">{value}</p>
                        </div>
                      ),
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* Compatibility Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <LifeBuoy className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">
              Compatibility with {comparisonModel?.name || "Selected Model"}
            </h2>
          </div>

          {!comparisonModel ? (
            <div className="p-6 text-center text-muted-foreground bg-muted/10 rounded-lg">
              Select a model to view compatibility requirements
            </div>
          ) : (
            <div className="space-y-3">
              {comparisonSpecs.map((spec) => (
                <Card
                  key={spec.label}
                  className={cn(
                    "p-4 flex flex-col sm:flex-row items-center gap-4 transition-all",
                    spec.isValid ? "border-green-500/20" : "border-red-500/20",
                  )}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-muted-foreground">{spec.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium">{spec.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        Minimum required
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto sm:ml-auto">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Your System
                      </p>
                      <p className="font-medium">{spec.value}</p>
                    </div>

                    <div className="h-8 w-px bg-border/50" />

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Required</p>
                      <p className="font-medium">{spec.requirement}</p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {spec.isValid ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-medium",
                          spec.isValid ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {spec.isValid ? "Compatible" : "Insufficient"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
