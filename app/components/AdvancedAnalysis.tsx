"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InfoIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CircuitBoard,
  MemoryStick,
  Cpu,
  Layers,
  Rocket,
  Gauge,
  BrainCircuit,
  HardDrive,
  Loader2,
  ScanSearch,
  X,
  AlertCircle,
} from "lucide-react";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { AdvancedAnalysis } from "@/app/data/llm-models";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const QUANTIZATION_DESCRIPTIONS = {
  fp8: "8-bit floating point - Highest precision, largest size",
  q6_k_s: "6-bit quantization - Very good balance of quality and size",
  q5_k_s: "5-bit quantization - Good balance of quality and size",
  q4_k_m: "4-bit medium quantization - Decent quality, smaller size",
  IQ4_XS: "4-bit improved quantization - Better quality than standard 4-bit",
  q3_k_m: "3-bit medium quantization - Lower quality, very small size",
  IQ3_XS: "3-bit improved quantization - Better quality than standard 3-bit",
  IQ2_XS: "2-bit improved quantization - Lowest quality, smallest size",
} as const;

function formatTokensPerSecond(tps: number | undefined) {
  if (!tps) return "N/A";
  if (tps < 1) return `${(tps * 1000).toFixed(1)} tokens/ms`;
  if (tps > 100) return `${(tps / 1000).toFixed(2)}k tokens/s`;
  return `${tps.toFixed(1)} tokens/s`;
}

function formatMemory(gb: number | undefined) {
  if (!gb) return "N/A";
  if (gb < 1) return `${(gb * 1000).toFixed(0)} MB`;
  return `${gb.toFixed(1)} GB`;
}

interface AdvancedAnalysisProps {
  analysis: AdvancedAnalysis | null;
  loading: boolean;
  modelId: string;
  setModelId: (id: string) => void;
  runAdvancedCheck: () => void;
  error?: string | null;
}

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

function cleanModelDescription(description: string): string {
  return description
    .replace(/!\[.*?\]\(.*?\)/g, "") // Remove markdown images
    .replace(/<img.*?>/g, "") // Remove HTML images
    .trim();
}

function QuantizationCard({
  level,
  result,
}: {
  level: string;
  result: ModelAnalysis;
}) {
  const canRun = result.runType !== "Won't run";
  const memoryUsed = result.memoryRequired || 0;
  const vramAvailable = 24; // Example value

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1",
        !canRun && "opacity-80 grayscale",
      )}
    >
      <div
        className={cn(
          "px-6 py-5 flex items-center justify-between",
          canRun
            ? "from-green-100/30 to-green-50/20 dark:from-green-900/10 dark:to-green-900/20"
            : "from-red-100/30 to-red-50/20 dark:from-red-900/10 dark:to-red-900/20",
        )}
      >
        <div className="space-y-2">
          <h3 className={cn("font-bold text-xl", !canRun && "text-red-600")}>
            {level.toUpperCase()}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {
              QUANTIZATION_DESCRIPTIONS[
                level as keyof typeof QUANTIZATION_DESCRIPTIONS
              ]
            }
          </p>
        </div>
        <Badge
          variant={canRun ? "secondary" : "destructive"}
          className="gap-2 px-4 py-2 rounded-full shadow-sm h-auto"
        >
          {canRun ? (
            <Rocket className="h-5 w-5" />
          ) : (
            <HardDrive className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{result.runType}</span>
        </Badge>
      </div>

      <CardContent className="p-6 space-y-6 bg-background">
        {memoryUsed > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Memory Usage</span>
              <span className="text-sm font-mono text-muted-foreground">
                {formatMemory(memoryUsed)} / {vramAvailable}GB
              </span>
            </div>
            <Progress
              value={(memoryUsed / vramAvailable) * 100}
              className="h-3 bg-muted"
              style={{
                ["--progress-primary" as string]:
                  memoryUsed > vramAvailable ? "#ef4444" : "#22c55e",
              }}
            />
          </div>
        )}

        <div className="grid gap-4">
          {result.tokensPerSecond !== null && (
            <MetricRow
              icon={<Gauge className="h-6 w-6 text-blue-500" />}
              label="Speed"
              value={formatTokensPerSecond(result.tokensPerSecond)}
              tooltip="Estimated generation speed"
            />
          )}
          {result.maxContext !== null && (
            <MetricRow
              icon={<BrainCircuit className="h-6 w-6 text-purple-500" />}
              label="Context Window"
              value={`${result.maxContext.toLocaleString()} tokens`}
              tooltip="Maximum input length supported"
            />
          )}
          {result.offloadPercentage > 0 && (
            <MetricRow
              icon={<Layers className="h-6 w-6 text-orange-500" />}
              label="GPU Utilization"
              value={`${(100 - result.offloadPercentage).toFixed(1)}%`}
              tooltip="Percentage of model loaded in GPU memory"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({
  icon,
  label,
  value,
  tooltip,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors gap-4">
      <Tooltip>
        <TooltipTrigger className="flex items-center gap-4 w-full">
          <span className="shrink-0">{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-sm max-w-[200px] text-center">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
      <span className="font-mono text-sm font-semibold whitespace-nowrap">
        {value}
      </span>
    </div>
  );
}

// Updated SpecItem component:
function SpecItem({
  icon,
  label,
  value,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-3">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={cn("font-mono text-sm font-semibold", className)}>
        {value}
      </span>
    </div>
  );
}

export function AdvancedAnalysisSection({
  analysis,
  loading,
  modelId,
  setModelId,
  runAdvancedCheck,
  error,
}: AdvancedAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TooltipProvider>
      <section className="max-w-7xl mx-auto px-4 py-8">
        <Card className="overflow-hidden border shadow-xl">
          {/* Hero Section */}
          <div className="relative">
            <div className="relative px-8 py-12 space-y-6 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-background rounded-full shadow-sm border">
                <Rocket className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">
                  Advanced Model Analyzer
                </h1>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Predict performance characteristics and memory requirements for
                LLMs across different quantization levels.
              </p>
            </div>
          </div>

          <CardContent className="space-y-8 p-8 pt-6">
            {/* Trending Models Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CircuitBoard className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Popular Models</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {TRENDING_MODELS.map((model) => (
                  <HoverCard key={model.id}>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModelId(model.id)}
                        className="h-auto py-2 px-3 text-xs hover:bg-primary/5 transition-colors"
                      >
                        <span className="truncate">
                          {model.id.split("/")[1]}
                        </span>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 p-3">
                      <div className="space-y-2">
                        <p className="text-sm font-medium truncate">
                          {model.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {model.description}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Model Input Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Cpu className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Model Configuration</h2>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    placeholder="Enter Hugging Face Model ID (e.g., mistralai/Mistral-7B-v0.1)"
                    className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/60"
                  />
                  {modelId && (
                    <button
                      onClick={() => setModelId("")}
                      className="absolute right-3 top-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={runAdvancedCheck}
                  disabled={loading || !modelId}
                  size="lg"
                  className="px-8 py-3 gap-2 transition-all"
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

            {/* Results Section */}
            {analysis && (
              <div className="space-y-8">
                <Separator className="my-8" />

                {/* Quantization Options */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Layers className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-semibold">
                      Quantization Levels
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 w-full">
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
                </div>

                {/* System & Model Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* System Specs */}
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <MemoryStick className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-semibold">System Specs</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <SpecItem
                          icon={<MemoryStick className="h-4 w-4" />}
                          label="Total RAM"
                          value={`${analysis.systemSpecs.totalRam} GB`}
                        />
                        <SpecItem
                          icon={<CircuitBoard className="h-4 w-4" />}
                          label="GPU Bandwidth"
                          value={`${analysis.systemSpecs.gpuBandwidth} GB/s`}
                        />
                        <SpecItem
                          icon={<HardDrive className="h-4 w-4" />}
                          label="VRAM per GPU"
                          value={`${analysis.systemSpecs.vramPerGpu} GB`}
                        />
                        <SpecItem
                          icon={<Layers className="h-4 w-4" />}
                          label="GPU Count"
                          value={analysis.systemSpecs.numGpus}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Model Details */}
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <BrainCircuit className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-semibold">Model Details</h3>
                      </div>
                      <div className="space-y-3">
                        <SpecItem
                          label="Model ID"
                          value={modelId}
                          className="font-mono text-sm"
                        />
                        <SpecItem
                          label="Parameters"
                          value={`${(analysis.modelParams / 1e9).toFixed(1)}B`}
                        />
                        {analysis.modelConfig?.architecture && (
                          <SpecItem
                            label="Architecture"
                            value={analysis.modelConfig.architecture}
                          />
                        )}
                        {analysis.modelConfig?.contextLength && (
                          <SpecItem
                            label="Context Window"
                            value={`${analysis.modelConfig.contextLength.toLocaleString()} tokens`}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Model Description */}
                {analysis.modelSummary?.description && (
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <InfoIcon className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-semibold">Description</h3>
                      </div>
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={setIsExpanded}
                        className="prose prose-sm dark:prose-invert max-w-none"
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: cleanModelDescription(
                              analysis.modelSummary.description,
                            ),
                          }}
                          className={cn(
                            "overflow-hidden transition-all",
                            !isExpanded && "max-h-[200px]",
                          )}
                        />
                        <CollapsibleTrigger className="w-full pt-4 flex items-center justify-center gap-2 text-primary hover:text-primary/80 transition-colors">
                          {isExpanded ? (
                            <>
                              <ChevronUpIcon className="h-4 w-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDownIcon className="h-4 w-4" />
                              Show More
                            </>
                          )}
                        </CollapsibleTrigger>
                      </Collapsible>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Error Handling */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="p-6 bg-destructive/5 flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-destructive">
                      Analysis Failed
                    </h3>
                    <p className="text-sm">{error}</p>
                    {error.includes("restricted") && (
                      <Button
                        variant="link"
                        size="sm"
                        className="px-0 text-destructive h-auto"
                        asChild
                      >
                        <a
                          href={`https://huggingface.co/${modelId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Request Access on Hugging Face →
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </section>
    </TooltipProvider>
  );
}
