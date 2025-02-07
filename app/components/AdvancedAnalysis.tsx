"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdvancedAnalysis } from "@/app/data/llm-models";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

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
    description: "Text Generation"
  },
  {
    id: "deepseek-ai/Janus-Pro-7B",
    description: "Any-to-Any"
  },
  {
    id: "mistralai/Mistral-Small-24B-Instruct-2501",
    description: "Text Generation"
  },
  {
    id: "deepseek-ai/DeepSeek-V3",
    description: "Text Generation"
  },
  {
    id: "hexgrad/Kokoro-82M",
    description: "Text-to-Speech"
  }
];

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
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center mb-8">
        Advanced Model Analysis
      </h2>
      <p className="text-center text-muted-foreground mb-8">
        For advanced users: Check memory requirements and performance estimates
        for specific Hugging Face models. Enter a model ID to analyze RAM usage
        and quantization options.
      </p>
      <Card className="neo-brutalist-box p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trending Models</label>
            <div className="flex flex-wrap gap-2">
              {TRENDING_MODELS.map((model) => (
                <HoverCard key={model.id}>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModelId(model.id)}
                      className="text-xs"
                    >
                      {model.id.split('/')[1]}
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-auto">
                    <div className="space-y-1">
                      <p className="text-sm font-mono">{model.id}</p>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <label className="text-sm font-medium">Hugging Face Model ID</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                placeholder="e.g., microsoft/phi-2"
                className="neo-input flex-1 p-2 text-sm"
              />
              <Button
                onClick={runAdvancedCheck}
                disabled={loading || !modelId}
                className="neo-button"
              >
                {loading ? "Analyzing..." : "Analyze Model"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-100 dark:bg-red-950/50 p-4 rounded-lg border-2 border-red-500">
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
          )}

          {analysis && analysis.systemSpecs && (
            <div className="space-y-6">
              {analysis.usingPlaceholders && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border-2 border-foreground neo-brutalist-shadow-sm">
                  Note: Using sample PC specifications since we couldn&apos;t
                  read your system specs. The analysis below assumes a mid-range
                  gaming PC with 16GB RAM and an RTX 3060.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Specs Card */}
                <Card className="neo-brutalist-box p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    System Specifications
                  </h3>
                  <div className="space-y-2">
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

                {/* Model Info Card */}
                <Card className="neo-brutalist-box p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Model Information
                  </h3>
                  <div className="space-y-2">
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

              {/* Model Summary Card - Updated Section */}
              {analysis.modelSummary?.description && (
                <Card className="neo-brutalist-box p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <InfoIcon className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Model Description</h3>
                  </div>
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={setIsExpanded}
                    className="space-y-2"
                  >
                    <div className="text-sm text-muted-foreground">
                      {analysis.modelSummary.description.length > 300 ? (
                        <>
                          <div className="prose prose-sm dark:prose-invert max-w-none [&_ul]:my-1 [&_li]:my-0">
                            <div dangerouslySetInnerHTML={{ 
                              __html: isExpanded 
                                ? analysis.modelSummary.description 
                                : `${analysis.modelSummary.description.slice(0, 300)}...`
                            }} />
                          </div>
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
                        </>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {analysis.modelSummary.description}
                        </div>
                      )}
                    </div>
                  </Collapsible>
                </Card>
              )}

              {/* Quantization Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysis.quantizationResults).map(
                  ([level, result]) => (
                    <Card key={level} className="neo-brutalist-box p-4">
                      <h3 className="text-lg font-semibold mb-2">
                        {level} Quantization
                      </h3>
                      <div className="space-y-2 text-sm">
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
        </div>
      </Card>
    </div>
  );
}
