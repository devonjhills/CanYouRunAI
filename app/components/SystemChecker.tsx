"use client";

import React, { useState } from "react";
import {
  MemoryStick,
  MonitorCog,
  HardDrive,
  ChevronDown,
  Info,
  CircuitBoard,
  Cpu,
  BrainCircuit,
  ScanSearch,
  Loader2,
  Layers,
  AlertCircle,
  Rocket,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LLMModel } from "../data/llm-models";
import { Progress } from "@/components/ui/progress";
import type { AdvancedAnalysis, ModelAnalysis } from "@/app/data/llm-models";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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

const gpuDetailTooltips: Record<string, string> = {
  Bandwidth: "Memory bandwidth in gigabytes per second",
  "Code Name": "GPU architecture code name",
  "Memory Type": "Type of memory used by the GPU",
  "Bus Width": "Width of the memory bus in bits",
  TDP: "Thermal Design Power in watts",
  "Process Node": "Manufacturing process node size",
  "Base Clock": "Default GPU core clock speed",
  "Boost Clock": "Maximum GPU core clock speed",
};

interface SystemCheckerProps {
  systemInfo?: SystemInfo;
  comparisonModel?: LLMModel;
  models?: LLMModel[];
  lastChecked?: string | null;
  onSystemInfoUpdate?: (info: SystemInfo) => void;
  onModelSelect: (modelId: string) => void;
  analysis?: AdvancedAnalysis | null;
  loading?: boolean;
  error?: string | null;
}

// Update the SystemSpecItem component styling
const SystemSpecItem = ({
  icon,
  label,
  value,
  tooltip,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip?: string;
  className?: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "glass hover-card-effect",
            "flex items-center gap-3 p-4 rounded-xl",
            className,
          )}
        >
          <span className="text-primary/90">{icon}</span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              {value}
            </p>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
          </div>
        </div>
      </TooltipTrigger>
      {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
    </Tooltip>
  </TooltipProvider>
);

const TRENDING_MODELS = [
  {
    id: "deepseek-ai/DeepSeek-R1",
    description: "Text Generation",
  },
  {
    id: "ehristoforu/Falcon3-MoE-2x7B-Insruct",
    description: "Text Generation",
  },
  {
    id: "Qwen/Qwen2.5-7B",
    description: "Text Generation",
  },
  {
    id: "deepseek-ai/DeepSeek-V3",
    description: "Text Generation",
  },
  {
    id: "Qwen/Qwen2.5-14B",
    description: "Text-to-Speech",
  },
];

// Add this helper function
function formatTokensPerSecond(tps: number | undefined | null) {
  if (!tps) return "N/A";
  if (tps < 1) return `${(tps * 1000).toFixed(1)} tokens/ms`;
  if (tps > 100) return `${(tps / 1000).toFixed(2)}k tokens/s`;
  return `${tps.toFixed(1)} tokens/s`;
}

// Add this component for analysis results
const QuantizationCard = ({
  level,
  result,
}: {
  level: string;
  result: ModelAnalysis;
}) => {
  const canRun = result.runType !== "Won't run";
  const memoryUsed = result.memoryRequired || 0;
  const vramAvailable = 24; // This should come from system info
  const isOverMemory = memoryUsed > vramAvailable;

  const QUANTIZATION_DESCRIPTIONS: Record<string, string> = {
    fp8: "8-bit floating point - Highest precision",
    q6_k_s: "6-bit quantization - Very good balance",
    q5_k_s: "5-bit quantization - Good balance",
    q4_k_m: "4-bit medium - Decent quality",
    IQ4_XS: "4-bit improved - Better than standard 4-bit",
    q3_k_m: "3-bit medium - Lower quality",
    IQ3_XS: "3-bit improved - Better than standard 3-bit",
    IQ2_XS: "2-bit improved - Lowest quality",
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-md",
        !canRun && "border-destructive/50 bg-destructive/5",
      )}
    >
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3
              className={cn("font-bold text-lg", !canRun && "text-destructive")}
            >
              {level.toUpperCase()}
            </h3>
            <Badge
              variant={canRun ? "secondary" : "destructive"}
              className="px-2 py-1"
            >
              <div className="flex items-center gap-1">
                {canRun ? (
                  <Rocket className="h-3.5 w-3.5" />
                ) : (
                  <HardDrive className="h-3.5 w-3.5" />
                )}
                <span>{result.runType}</span>
              </div>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {QUANTIZATION_DESCRIPTIONS[level] || "Custom quantization level"}
          </p>
        </div>

        <Separator />

        {/* Memory Usage */}
        {memoryUsed > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Memory Usage</span>
              <span
                className={cn(
                  "font-mono",
                  isOverMemory && "text-destructive font-semibold",
                )}
              >
                {memoryUsed.toFixed(1)}GB / {vramAvailable}GB
              </span>
            </div>
            <Progress
              value={isOverMemory ? 100 : (memoryUsed / vramAvailable) * 100}
              className={cn(
                "h-2",
                isOverMemory ? "bg-destructive/20" : "bg-muted",
                "[&>[role=progressbar]]:transition-all duration-300",
                isOverMemory
                  ? "[&>[role=progressbar]]:bg-destructive"
                  : "[&>[role=progressbar]]:bg-primary",
              )}
            />
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
            <span className="font-medium">Speed</span>
            <span className="font-mono">
              {formatTokensPerSecond(result.tokensPerSecond)}
            </span>
          </div>
          {result.maxContext && (
            <div className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
              <span className="font-medium">Context Length</span>
              <span className="font-mono">
                {result.maxContext.toLocaleString()} tokens
              </span>
            </div>
          )}
          {result.offloadPercentage > 0 && (
            <div className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
              <span className="font-medium">GPU Utilization</span>
              <span className="font-mono">
                {(100 - result.offloadPercentage).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const SystemChecker = ({
  systemInfo,
  onModelSelect,
  analysis,
  loading,
  error,
}: SystemCheckerProps) => {
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [modelInput, setModelInput] = useState("");

  const handleAnalyze = (modelId: string) => {
    setSelectedModelId(modelId);
    setModelInput(modelId);
    onModelSelect?.(modelId);
  };

  return (
    <Card className="card-base shadow-xl">
      <div className="relative p-6 space-y-10">
        {/* Hero Section with enhanced styling */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3">
            <CircuitBoard className="h-8 w-8 text-primary" />
            <h1 className="heading-1">System Compatibility</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Check your system&apos;s compatibility with popular AI models and
            get detailed performance insights
          </p>
        </div>

        <Separator className="bg-border/60" />

        {/* System Specifications with improved grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <MonitorCog className="h-6 w-6 text-primary" />
            <h2 className="heading-2">Hardware Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SystemSpecItem
              icon={<MemoryStick className="w-5 h-5" />}
              label="System RAM"
              value={systemInfo?.RAM || "Not detected"}
              tooltip="Total available system memory"
              className="h-full"
            />
            <SystemSpecItem
              icon={<MonitorCog className="w-5 h-5" />}
              label="GPU"
              value={systemInfo?.GPU || "Not detected"}
              tooltip="Graphics Processing Unit"
              className="h-full"
            />
            <SystemSpecItem
              icon={<MemoryStick className="w-5 h-5" />}
              label="VRAM"
              value={systemInfo?.VRAM || "Not detected"}
              tooltip="Video Memory"
              className="h-full"
            />
            <SystemSpecItem
              icon={<HardDrive className="w-5 h-5" />}
              label="Storage"
              value={systemInfo?.Storage || "Not detected"}
              tooltip="Available disk space"
              className="h-full"
            />
          </div>

          {/* Enhanced GPU Details Section */}
          {systemInfo?.GPUDetails && (
            <Collapsible className="glass rounded-xl overflow-hidden">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MonitorCog className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Advanced GPU Details</span>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 pt-2 border-t bg-card/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                        <div key={label} className="space-y-1 relative">
                          <p className="text-muted-foreground text-xs flex items-center gap-1">
                            {label}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {gpuDetailTooltips[label] ||
                                    "No information available."}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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

        <Separator className="bg-border/60" />

        {/* Model Selection with improved styling */}
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-3">
              <Cpu className="h-6 w-6 text-primary" />
              <h2 className="heading-2">Model Analysis</h2>
            </div>
            {selectedModelId && (
              <Badge variant="secondary" className="px-3 py-1.5">
                <span className="truncate max-w-[200px] inline-block">
                  {selectedModelId}
                </span>
              </Badge>
            )}
          </div>

          {/* Enhanced Popular Models Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Popular Models
              </h3>
              <Badge variant="outline" className="text-xs">
                Trending
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {TRENDING_MODELS.map((model) => (
                <HoverCard key={model.id}>
                  <HoverCardTrigger asChild>
                    <Button
                      variant={
                        selectedModelId === model.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleAnalyze(model.id)}
                      className="focus-ring h-auto w-full py-2.5 px-3 text-xs transition-all"
                    >
                      <span className="truncate">{model.id.split("/")[1]}</span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="glass w-64 p-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium truncate">{model.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {model.description}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </div>

          {/* Enhanced Model Input Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground px-1">
              Custom Model
            </h3>
            <div className="glass p-4 rounded-xl space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    placeholder="Enter Hugging Face Model ID (e.g., mistralai/Mistral-7B-v0.1)"
                    className="focus-ring w-full px-4 py-3 rounded-lg border bg-background/50 transition-all placeholder:text-muted-foreground/60"
                  />
                  {modelInput && (
                    <button
                      onClick={() => setModelInput("")}
                      className="absolute right-3 top-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => handleAnalyze(modelInput)}
                  disabled={loading || !modelInput}
                  size="lg"
                  className="focus-ring px-8 py-3 gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ScanSearch className="h-4 w-4" />
                      Analyze Model
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-8 pt-4">
              {/* Model Details and Storage Requirements Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <BrainCircuit className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">Model Details</h3>
                    </div>
                    <div className="space-y-3">
                      <SystemSpecItem
                        icon={<Info className="w-4 h-4" />}
                        label="Model ID"
                        value={selectedModelId}
                        tooltip="Hugging Face Model Identifier"
                      />
                      {analysis.modelParams && (
                        <SystemSpecItem
                          icon={<Layers className="w-4 h-4" />}
                          label="Parameters"
                          value={`${(analysis.modelParams / 1e9).toFixed(1)}B`}
                          tooltip="Model size in billions of parameters"
                        />
                      )}
                      {typeof analysis.modelSizeGb === "number" && (
                        <SystemSpecItem
                          icon={<HardDrive className="w-4 h-4" />}
                          label="Storage Required"
                          value={`${analysis.modelSizeGb.toFixed(1)} GB`}
                          tooltip="Storage space needed to download this model"
                          className={cn(
                            analysis.modelSizeGb >
                              parseFloat(systemInfo?.Storage || "0")
                              ? "border-destructive bg-destructive/10"
                              : "border-green-500/20 bg-green-500/10",
                          )}
                        />
                      )}
                      {analysis.modelConfig && (
                        <SystemSpecItem
                          icon={<Cpu className="w-4 h-4" />}
                          label="Architecture"
                          value={analysis.modelConfig.architecture}
                          tooltip="Model architecture type"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {typeof analysis.modelSizeGb === "number" && (
                  <Card className="glass">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <HardDrive className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-semibold">
                          Storage Requirements
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              Available Storage
                            </span>
                            <span className="font-mono">
                              {systemInfo?.Storage || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              Required Storage
                            </span>
                            <span className="font-mono">
                              {analysis.modelSizeGb.toFixed(1)} GB
                            </span>
                          </div>
                          <Progress
                            value={
                              analysis.modelSizeGb >
                              parseFloat(systemInfo?.Storage || "0")
                                ? 100 // Set to 100 when required storage exceeds available
                                : (analysis.modelSizeGb /
                                    parseFloat(systemInfo?.Storage || "0")) *
                                  100
                            }
                            className={cn(
                              "h-2",
                              analysis.modelSizeGb >
                                parseFloat(systemInfo?.Storage || "0")
                                ? "bg-destructive/20"
                                : "bg-muted [&>[role=progressbar]]:bg-green-500",
                            )}
                          />
                          {/* Show percentage when over limit */}
                          {analysis.modelSizeGb >
                            parseFloat(systemInfo?.Storage || "0") && (
                            <p className="text-xs text-destructive font-medium text-right">
                              {(
                                (analysis.modelSizeGb /
                                  parseFloat(systemInfo?.Storage || "1")) *
                                100
                              ).toFixed(0)}
                              % of available space
                            </p>
                          )}
                        </div>

                        {analysis.modelSizeGb >
                          parseFloat(systemInfo?.Storage || "0") && (
                          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            <span>Insufficient storage space available</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Separator className="bg-border/60" />

              {/* Quantization Analysis */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="h-6 w-6 text-primary" />
                    <h2 className="heading-2">Quantization Options</h2>
                  </div>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">
                        Different quantization levels affect model size and
                        performance. Higher bits generally mean better quality
                        but require more VRAM.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analysis.quantizationResults).map(
                    ([level, result]) => (
                      <QuantizationCard
                        key={level}
                        level={level}
                        result={result}
                      />
                    ),
                  )}
                </div>

                {error && (
                  <Card className="border-destructive">
                    <CardContent className="p-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <p className="text-sm text-destructive">{error}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SystemChecker;
