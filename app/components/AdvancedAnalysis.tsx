"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InfoIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HelpCircle,
  CircuitBoard,
  MemoryStick,
  Cpu,
  Layers,
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

const QUANTIZATION_BPWS = {
  fp8: 8.0,
  q6_k_s: 6.6,
  q5_k_s: 5.5,
  q4_k_m: 4.8,
  IQ4_XS: 4.3,
  q3_k_m: 3.9,
  IQ3_XS: 3.3,
  IQ2_XS: 2.4,
} as const;

function formatTokensPerSecond(tps: number | undefined) {
  if (!tps) return "N/A";
  if (tps < 1) return `${(tps * 1000).toFixed(1)} t/ms`;
  return `${tps.toFixed(1)} t/s`;
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
      <section className="space-y-6 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-4 p-6 bg-muted/30 rounded-xl shadow-sm">
          <h2 className="text-3xl font-bold">Advanced Model Analysis</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            For advanced users: Check memory requirements and performance
            estimates for specific Hugging Face models.
          </p>
        </div>

        {/* Main Card Container */}
        <Card className="shadow-sm">
          <CardContent className="space-y-8 p-6">
            {/* Trending Models Section */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div className="bg-secondary/20 p-4 border-b">
                <label className="text-lg font-semibold">Popular Models</label>
              </div>
              <div className="p-4 bg-background">
                <div className="flex flex-wrap gap-2">
                  {TRENDING_MODELS.map((model) => (
                    <HoverCard key={model.id}>
                      <HoverCardTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setModelId(model.id)}
                          className="text-xs bg-background hover:bg-accent/20"
                        >
                          {model.id.split("/")[1]}
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-auto p-3 shadow-md">
                        <div className="space-y-1">
                          <p className="text-sm font-mono">{model.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {model.description}
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Input Section */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div className="bg-primary/20 p-4 border-b">
                <label className="text-lg font-semibold">
                  Hugging Face Model ID
                </label>
              </div>
              <div className="p-4 bg-background">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    placeholder="e.g., microsoft/phi-2"
                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                  />
                  <Button
                    onClick={runAdvancedCheck}
                    disabled={loading || !modelId}
                    className="px-6"
                  >
                    {loading ? "Analyzing..." : "Analyze Model"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quantization Results */}
            {analysis && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Quantization Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analysis.quantizationResults).map(
                    ([level, result]) => (
                      <Card
                        key={level}
                        className={cn(
                          "overflow-hidden transition-all hover:shadow-md",
                          result.runType === "Won't run" && "opacity-50",
                        )}
                      >
                        <div
                          className={cn(
                            "p-4 border-b",
                            result.runType === "Won't run"
                              ? "bg-destructive/20"
                              : "bg-success/20",
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1.5 group">
                                <h3
                                  className={cn(
                                    "text-lg font-semibold",
                                    result.runType === "Won't run" &&
                                      "text-destructive",
                                  )}
                                >
                                  {level}
                                </h3>
                                <HelpCircle
                                  className={cn(
                                    "h-4 w-4 transition-colors",
                                    result.runType === "Won't run"
                                      ? "text-destructive group-hover:text-destructive/80"
                                      : "text-success group-hover:text-success/80",
                                  )}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Quantization level:{" "}
                                  {
                                    QUANTIZATION_BPWS[
                                      level as keyof typeof QUANTIZATION_BPWS
                                    ]
                                  }{" "}
                                  bits per weight. Lower values use less memory
                                  but may reduce model quality.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="p-4 bg-background space-y-3 text-sm">
                          <div className="flex justify-between">
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1.5 group">
                                <span className="text-muted-foreground group-hover:text-foreground">
                                  Run Type:
                                </span>
                                <HelpCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Indicates whether the model can run on your
                                  system and how
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <span
                              className={cn(
                                result.runType === "Won't run" &&
                                  "text-destructive",
                              )}
                            >
                              {result.runType}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1.5 group">
                                <span className="text-muted-foreground group-hover:text-foreground">
                                  Memory Required:
                                </span>
                                <HelpCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Total RAM/VRAM needed to run the model</p>
                              </TooltipContent>
                            </Tooltip>
                            <span>
                              {result.memoryRequired?.toFixed(1) ?? "N/A"} GB
                            </span>
                          </div>
                          {result.tokensPerSecond != null && (
                            <div className="flex justify-between">
                              <Tooltip>
                                <TooltipTrigger className="flex items-center gap-1.5 group">
                                  <span className="text-muted-foreground group-hover:text-foreground">
                                    Speed:
                                  </span>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Estimated text generation speed in tokens
                                    per second
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <span>
                                {formatTokensPerSecond(result.tokensPerSecond)}
                              </span>
                            </div>
                          )}
                          {result.maxContext != null && (
                            <div className="flex justify-between">
                              <Tooltip>
                                <TooltipTrigger className="flex items-center gap-1.5 group">
                                  <span className="text-muted-foreground group-hover:text-foreground">
                                    Max Context:
                                  </span>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Maximum number of tokens the model can
                                    process at once
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <span>
                                {result.maxContext.toLocaleString()} tokens
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl overflow-hidden shadow-sm">
                <div className="bg-destructive/20 p-4">
                  <p className="font-medium text-destructive">
                    Error analyzing model:
                  </p>
                  <p className="mt-2">{error}</p>
                  {error.includes("restricted") && (
                    <p className="mt-2">
                      Please visit{" "}
                      <a
                        href={`https://huggingface.co/${modelId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        the model page on Hugging Face
                      </a>{" "}
                      to request access.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Analysis Details */}
            {analysis && analysis.systemSpecs && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* System Specs */}
                  <Card className="shadow-sm">
                    <div className="bg-accent/20 p-4 border-b">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Cpu className="h-5 w-5" />
                        System Specifications
                      </h3>
                    </div>
                    <div className="p-4 bg-background space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 min-w-[6rem]">
                          <MemoryStick className="h-4 w-4 text-muted-foreground" />
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1.5 group">
                              <span className="text-sm">Total RAM</span>
                              <HelpCircle className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Total system memory available</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <span className="font-mono text-sm">
                          {analysis.systemSpecs.totalRam} GB
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 min-w-[6rem]">
                          <CircuitBoard className="h-4 w-4 text-muted-foreground" />
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1.5 group">
                              <span className="text-sm">GPU</span>
                              <HelpCircle className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Graphics processor model</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Tooltip>
                          <TooltipTrigger className="font-mono text-sm truncate max-w-[200px]">
                            {analysis.systemSpecs.gpuBrand}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{analysis.systemSpecs.gpuBrand}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 min-w-[6rem]">
                            <MemoryStick className="h-4 w-4 text-muted-foreground" />
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1.5 group">
                                <span className="text-sm">VRAM</span>
                                <HelpCircle className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Video memory per GPU</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="font-mono text-sm">
                            {analysis.systemSpecs.vramPerGpu} GB
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 min-w-[6rem]">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1.5 group">
                                <span className="text-sm">GPUs</span>
                                <HelpCircle className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Number of graphics cards installed</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="font-mono text-sm">
                            {analysis.systemSpecs.numGpus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Model Information */}
                  <Card className="shadow-sm">
                    <div className="bg-accent/20 p-4 border-b">
                      <h3 className="text-lg font-semibold">
                        Model Information
                      </h3>
                    </div>
                    <div className="p-4 bg-background space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Model ID:</span>
                        <span className="font-mono text-sm">{modelId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Parameters:</span>
                        <span>{(analysis.modelParams / 1e9).toFixed(3)}B</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Model Summary Card */}
                {analysis.modelSummary?.description && (
                  <div className="rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-muted p-4 border-b flex items-center gap-2">
                      <InfoIcon className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">
                        Model Description
                      </h3>
                    </div>
                    <div className="p-4 bg-background">
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={setIsExpanded}
                        className="space-y-2"
                      >
                        <div className="text-sm text-muted-foreground">
                          {(() => {
                            const cleanDescription = cleanModelDescription(
                              analysis.modelSummary.description,
                            );
                            const shouldTruncate =
                              cleanDescription.length > 300;
                            return (
                              <>
                                <div
                                  className="prose prose-sm dark:prose-invert max-w-none [&_ul]:my-1 [&_li]:my-0"
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      shouldTruncate && !isExpanded
                                        ? `${cleanDescription.slice(0, 300)}...`
                                        : cleanDescription,
                                  }}
                                />
                                {shouldTruncate && (
                                  <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2">
                                    {isExpanded ? (
                                      <>
                                        <ChevronUpIcon className="h-4 w-4" />
                                        Show less
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDownIcon className="h-4 w-4" />
                                        Show more
                                      </>
                                    )}
                                  </CollapsibleTrigger>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </Collapsible>
                    </div>
                  </div>
                )}

                {/* Model Config Card */}
                {analysis?.modelConfig && (
                  <Card className="shadow-sm">
                    <div className="bg-accent/20 p-4 border-b">
                      <h3 className="text-lg font-semibold">
                        Model Configuration
                      </h3>
                    </div>
                    <div className="p-4 bg-background space-y-3">
                      <div className="flex justify-between">
                        <span>Architecture:</span>
                        <span>
                          {analysis.modelConfig?.architecture ?? "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Context Length:</span>
                        <span>
                          {analysis.modelConfig?.contextLength
                            ? analysis.modelConfig.contextLength.toLocaleString()
                            : "N/A"}{" "}
                          tokens
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parameter Size:</span>
                        <span>
                          {analysis.modelConfig?.parameterSize ?? "N/A"}
                        </span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </TooltipProvider>
  );
}
