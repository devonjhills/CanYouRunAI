"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdvancedAnalysis } from "@/app/data/llm-models";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

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
    <section className="space-y-0">
      <div className="text-center space-y-4 p-6 bg-muted/30 rounded-t-xl border-2 border-foreground">
        <h2 className="text-3xl font-bold">Advanced Model Analysis</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          For advanced users: Check memory requirements and performance
          estimates for specific Hugging Face models. Enter a model ID to
          analyze RAM usage and quantization options.
        </p>
      </div>

      <Card className="neo-brutalist-box border-2 border-foreground rounded-t-none border-t-0">
        <CardContent className="space-y-12 p-6">
          {/* Trending Models section - More distinct styling */}
          <div className="rounded-xl overflow-hidden border-2 border-foreground">
            <div className="bg-secondary/20 p-4 border-b-2 border-foreground">
              <label className="text-lg font-semibold">Trending Models</label>
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
                    <HoverCardContent className="w-auto p-3 neo-brutalist-shadow border-2 border-foreground">
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

          {/* Model Input section - Different background color */}
          <div className="rounded-xl overflow-hidden border-2 border-foreground">
            <div className="bg-primary/20 p-4 border-b-2 border-foreground">
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
                  className="neo-input flex-1 border-2"
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

          {/* Error Message - Updated styling */}
          {error && (
            <div className="rounded-xl overflow-hidden border-2 border-destructive">
              <div className="bg-destructive/20 p-4 border-b-2 border-destructive">
                <p className="font-semibold">Error analyzing model</p>
              </div>
              <div className="p-4 bg-destructive/10">
                <p className="font-medium">Error analyzing model:</p>
                <p>{error}</p>
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

          {/* Analysis Results - Enhanced visual hierarchy */}
          {analysis && analysis.systemSpecs && (
            <div className="space-y-12">
              {/* System specs and model info cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="overflow-hidden border-2 border-foreground neo-brutalist-shadow">
                  <div className="bg-accent/20 p-4 border-b-2 border-foreground">
                    <h3 className="text-lg font-semibold">
                      System Specifications
                    </h3>
                  </div>
                  <div className="p-4 bg-background space-y-3">
                    <div className="flex justify-between">
                      <span>Total RAM:</span>
                      <span>{analysis.systemSpecs.totalRam} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RAM Bandwidth:</span>
                      <span>{analysis.systemSpecs.ramBandwidth} GB/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GPU:</span>
                      <span>{analysis.systemSpecs.gpuBrand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VRAM per GPU:</span>
                      <span>{analysis.systemSpecs.vramPerGpu} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of GPUs:</span>
                      <span>{analysis.systemSpecs.numGpus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GPU Bandwidth:</span>
                      <span>{analysis.systemSpecs.gpuBandwidth} GB/s</span>
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden border-2 border-foreground neo-brutalist-shadow">
                  <div className="bg-accent/20 p-4 border-b-2 border-foreground">
                    <h3 className="text-lg font-semibold">Model Information</h3>
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

              {/* Model Summary Card - Updated styling */}
              {analysis.modelSummary?.description && (
                <div className="rounded-xl overflow-hidden border-2 border-foreground">
                  <div className="bg-muted p-4 border-b-2 border-foreground flex items-center gap-2">
                    <InfoIcon className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Model Description</h3>
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
                          const shouldTruncate = cleanDescription.length > 300;

                          return (
                            <>
                              <div className="prose prose-sm dark:prose-invert max-w-none [&_ul]:my-1 [&_li]:my-0">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      shouldTruncate && !isExpanded
                                        ? `${cleanDescription.slice(0, 300)}...`
                                        : cleanDescription,
                                  }}
                                />
                              </div>
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

              {/* Quantization Results - Different styling for each card */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(analysis.quantizationResults).map(
                  ([level, result], index) => (
                    <Card
                      key={level}
                      className="overflow-hidden border-2 border-foreground neo-brutalist-shadow"
                    >
                      <div
                        className={cn(
                          "p-4 border-b-2 border-foreground",
                          index === 0 && "bg-primary/20",
                          index === 1 && "bg-secondary/20",
                          index === 2 && "bg-accent/20",
                        )}
                      >
                        <h3 className="text-lg font-semibold">
                          {level} Quantization
                        </h3>
                      </div>
                      <div className="p-4 bg-background space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Run Type:</span>
                          <span>{result.runType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Memory Required:</span>
                          <span>
                            {result.memoryRequired?.toFixed(1) ?? "N/A"} GB
                          </span>
                        </div>
                        {result.offloadPercentage != null &&
                          result.offloadPercentage > 0 && (
                            <div className="flex justify-between">
                              <span>Offload %:</span>
                              <span>
                                {result.offloadPercentage.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        {result.tokensPerSecond != null && (
                          <div className="flex justify-between">
                            <span>Speed:</span>
                            <span>{result.tokensPerSecond.toFixed(1)} t/s</span>
                          </div>
                        )}
                        {result.maxContext != null && (
                          <div className="flex justify-between">
                            <span>Max Context:</span>
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
        </CardContent>
      </Card>
    </section>
  );
}
