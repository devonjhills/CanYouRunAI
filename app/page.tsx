"use client";

import { SystemRequirements } from "./components/SystemRequirements";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { llmModels } from "@/app/data/llm-models";
import { useEffect, useState } from "react";
import { LLMModel } from "@/app/data/llm-models";
import { SystemInfo, SystemChecker } from "@/app/components/SystemChecker";
import Cookies from "js-cookie";
import type { SystemSpecs, AdvancedAnalysis } from "./data/llm-models";
import { AdvancedAnalysisSection } from "./components/AdvancedAnalysis";
import { ModelSelect } from "@/app/components/ModelSelect";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CPUSelector } from "@/app/components/CPUSelector";
import { GPUSelector } from "@/app/components/GPUSelector";
import { CPUSpecs } from "@/app/data/hardware-db";
import { GPUSpecs } from "@/app/data/gpu-db";

const isProd = process.env.NODE_ENV === "production";

// URL for the quantize worker; fallback to placeholder if not set.
const QUANTIZE_WORKER_URL =
  process.env.NEXT_PUBLIC_QUANTIZE_WORKER_URL ||
  "https://canyourunai-quantize.digitalveilmedia.workers.dev";

export default function Home() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | undefined>(
    undefined,
  );
  const [selectedModel, setSelectedModel] = useState<LLMModel | undefined>();
  const [comparisonModel, setComparisonModel] = useState<LLMModel | undefined>(
    undefined,
  );
  const [analysis, setAnalysis] = useState<AdvancedAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // This state now holds the modelId entered in the advanced tab.
  const [modelId, setModelId] = useState("");
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [formData, setFormData] = useState<SystemInfo>({
    CPU: "",
    RAM: "",
    GPU: "",
    VRAM: "",
    Storage: "",
    GPUBandwidth: undefined,
  });

  useEffect(() => {
    // Initial check on page load
    const savedInfo = getStoredSystemInfo();
    if (savedInfo) {
      setSystemInfo(savedInfo);
      // Get the timestamp from storage
      const timestamp = isProd
        ? Cookies.get("systemInfoTimestamp")
        : localStorage.getItem("systemInfoTimestamp");
      setLastChecked(timestamp || null);
    }
  }, []);

  const handleModelSelect = (modelId: string) => {
    const model = llmModels.find((m) => m.id === modelId);
    setSelectedModel(model);
    setComparisonModel(model);
  };

  // Store system info
  const storeSystemInfo = (info: SystemInfo) => {
    const timestamp = new Date().toISOString();
    if (isProd) {
      Cookies.set("systemInfo", JSON.stringify(info), {
        expires: 1,
        secure: true,
        sameSite: "none",
      });
      Cookies.set("systemInfoTimestamp", timestamp, {
        expires: 1,
        secure: true,
        sameSite: "none",
      });
    } else {
      localStorage.setItem("systemInfo", JSON.stringify(info));
      localStorage.setItem("systemInfoTimestamp", timestamp);
    }
  };

  // Get stored system info
  const getStoredSystemInfo = () => {
    if (isProd) {
      const savedInfo = Cookies.get("systemInfo");
      return savedInfo ? JSON.parse(savedInfo) : null;
    } else {
      const savedInfo = localStorage.getItem("systemInfo");
      return savedInfo ? JSON.parse(savedInfo) : null;
    }
  };

  const runAdvancedCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const specs: SystemSpecs = {
        totalRam:
          systemInfo?.RAM && systemInfo.RAM !== "Unknown"
            ? parseFloat(systemInfo.RAM.split(" ")[0])
            : 16,
        ramBandwidth: 48, // Typical DDR4 bandwidth in GB/s
        vramPerGpu:
          systemInfo?.VRAM && systemInfo.VRAM !== "Unknown"
            ? parseFloat(systemInfo.VRAM.split(" ")[0])
            : 8,
        numGpus: 1,
        gpuBandwidth: systemInfo?.GPUBandwidth ?? 300, // Use actual GPU bandwidth if available
        gpuBrand:
          systemInfo?.GPU && systemInfo.GPU !== "Unknown"
            ? systemInfo.GPU
            : "NVIDIA GeForce RTX 3060",
      };

      // Use the modelId from the text input (advanced tab), not selectedModel.
      const response = await fetch(`${QUANTIZE_WORKER_URL}/api/quantize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId, systemSpecs: specs }),
        mode: "cors",
        credentials: "include",
      });

      const data = (await response.json()) as {
        error?: string;
      } & AdvancedAnalysis;

      if (!response.ok) {
        setError(data.error || "Failed to analyze model");
        return;
      }

      setAnalysis(data);
    } catch (error) {
      console.error("Failed to run advanced check:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    storeSystemInfo(formData);
    setSystemInfo(formData);
    const timestamp = new Date().toISOString();
    setLastChecked(timestamp);
    if (isProd) {
      Cookies.set("systemInfoTimestamp", timestamp, {
        expires: 1,
        secure: true,
        sameSite: "none",
      });
    } else {
      localStorage.setItem("systemInfoTimestamp", timestamp);
    }
    const element = document.getElementById("system-requirements");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      <section className="py-12 px-6 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section with System Check */}
          <Card className="neo-card p-8 border-2 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <div className="relative space-y-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                  Can I Run this LLM{" "}
                  <span className="text-primary">locally?</span>
                </h1>
              </div>

              {/* Model Selection and Actions */}
              <div className="space-y-6">
                <ModelSelect
                  models={llmModels}
                  selectedModelId={selectedModel?.id}
                  onModelSelect={handleModelSelect}
                  className="w-full"
                  triggerClassName="neo-input w-full p-4 text-lg hover:border-primary/50 transition-colors"
                  placeholder="Choose a model from our list"
                />

                <Card className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold">Enter Your Hardware Details</h2>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <CPUSelector
                      onSelect={(cpu: CPUSpecs) => {
                        setFormData(prev => ({
                          ...prev,
                          CPU: cpu.model,
                        }));
                      }}
                      selectedModel={formData.CPU}
                    />

                    <GPUSelector
                      onSelect={(gpu: GPUSpecs) => {
                        setFormData(prev => ({
                          ...prev,
                          GPU: gpu.model,
                          VRAM: `${gpu.vram} GB`,
                          GPUBandwidth: gpu.bandwidth,
                        }));
                      }}
                      selectedModel={formData.GPU}
                    />

                    <div className="space-y-2">
                      <Label>RAM (GB)</Label>
                      <Input
                        type="number"
                        value={formData.RAM.split(" ")[0] || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            RAM: `${e.target.value} GB`,
                          }))
                        }
                        placeholder="Enter RAM amount"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Storage (GB)</Label>
                      <Input
                        type="number"
                        value={formData.Storage.split(" ")[0] || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            Storage: `${e.target.value} GB`,
                          }))
                        }
                        placeholder="Enter storage amount"
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full neo-button py-6 bg-primary hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    onClick={handleSubmit}
                    disabled={!selectedModel || !formData.CPU || !formData.GPU || !formData.RAM || !formData.Storage}
                  >
                    Check Compatibility
                  </Button>
                </Card>
              </div>
            </div>
          </Card>

          {/* System Requirements Check */}
          {systemInfo && (
            <div id="system-requirements">
              <SystemChecker
                systemInfo={systemInfo}
                comparisonModel={comparisonModel}
                models={llmModels}
                onModelSelect={(id) =>
                  setComparisonModel(llmModels.find((m) => m.id === id))
                }
                lastChecked={lastChecked}
              />
            </div>
          )}

          {/* Rest of the sections */}
          <section className="bg-muted/30 py-16">
            <div className="space-y-16">
              <div id="advanced-analysis">
                <AdvancedAnalysisSection
                  analysis={analysis}
                  loading={loading}
                  modelId={modelId}
                  setModelId={setModelId}
                  runAdvancedCheck={runAdvancedCheck}
                  error={error}
                />
              </div>

              <div id="model-requirements" className="space-y-6">
                <SystemRequirements />
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
