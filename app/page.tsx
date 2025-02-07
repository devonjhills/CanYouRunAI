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
  const [status, setStatus] = useState<
    "idle" | "downloading" | "waiting" | "gathering" | "finished"
  >("idle");
  const [comparisonModel, setComparisonModel] = useState<LLMModel | undefined>(
    undefined,
  );
  const [analysis, setAnalysis] = useState<AdvancedAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // This state now holds the modelId entered in the advanced tab.
  const [modelId, setModelId] = useState("");
  const [lastChecked, setLastChecked] = useState<string | null>(null);

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

  useEffect(() => {
    const checkSystemInfo = async () => {
      try {
        const response = await fetch(
          "https://canyourunai-worker.digitalveilmedia.workers.dev/api/system-check",
          {
            credentials: "include",
            mode: "cors",
          },
        );
        const data = (await response.json()) as {
          success: boolean;
          systemInfo?: SystemInfo;
        };

        console.log("API response:", data);

        if (
          data.success &&
          data.systemInfo &&
          data.systemInfo.CPU &&
          data.systemInfo.RAM &&
          data.systemInfo.GPU &&
          data.systemInfo.VRAM &&
          data.systemInfo.OS
        ) {
          setStatus("gathering");
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Store in localStorage or cookie
          storeSystemInfo(data.systemInfo);
          setSystemInfo(data.systemInfo);
          setStatus("finished");

          const element = document.getElementById("system-requirements");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      } catch (error) {
        console.error("Error checking system info:", error);
      }
    };

    // Poll only when waiting for exe results
    if (status === "waiting" || status === "gathering") {
      const interval = setInterval(checkSystemInfo, 2000);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (status === "finished") {
      // Wait 1 second before closing the overlay
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleModelSelect = (modelId: string) => {
    const model = llmModels.find((m) => m.id === modelId);
    setSelectedModel(model);
    setComparisonModel(model);
  };

  const WINDOWS_EXE_URL = "/CanYouRunAI.exe";

  const handleSystemCheck = (e: React.MouseEvent) => {
    e.preventDefault();

    // If we already have system info, show confirmation dialog
    if (systemInfo) {
      if (
        !confirm(
          "Would you like to scan your system again? This is recommended if your hardware has changed recently.",
        )
      ) {
        return;
      }
    }

    setStatus("downloading");

    fetch(WINDOWS_EXE_URL)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "CanYouRunAI.exe";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(url);

        setStatus("waiting");
      });
  };

  const StatusOverlay = () => {
    if (status === "idle") return null;

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="space-y-6">
            <div className="flex justify-between">
              {["downloading", "waiting", "gathering", "finished"].map(
                (step, i) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                    ${
                      status === step
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted text-muted-foreground"
                    }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-muted-foreground capitalize">
                      {step}
                    </span>
                  </div>
                ),
              )}
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">
                {status === "downloading" && "Starting Download..."}
                {status === "waiting" && "Waiting for System Check"}
                {status === "gathering" && "Gathering Data"}
                {status === "finished" && "Complete!"}
              </h2>
              <p className="text-muted-foreground">
                {status === "downloading" &&
                  "Your download should begin automatically..."}
                {status === "waiting" && (
                  <>
                    Please run the downloaded CanYouRunAI.exe file
                    <br />
                    <span className="text-xs mt-2 block">
                      This tool only collects system specifications, no personal
                      information.
                    </span>
                  </>
                )}
                {status === "gathering" && "Gathering system information..."}
                {status === "finished" && "Done!"}
              </p>
            </div>

            {(status === "gathering" || status === "downloading") && (
              <div className="flex justify-center mt-8">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
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
      // Build systemSpecs with fallback values if systemInfo is undefined or contains "Unknown"
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
        gpuBandwidth: 300, // Typical mid-range GPU bandwidth in GB/s
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-background to-muted/30">
        <Card className="neo-card max-w-4xl mx-auto mb-12 p-8 md:p-12 border-2 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <div className="relative space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                Can I Run this LLM{" "}
                <span className="text-primary">locally?</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Analyze your computer in seconds.{" "}
                <span className="font-bold text-foreground">100% Free.</span>
              </p>
            </div>

            {/* Action Steps */}
            <div className="mt-12 space-y-8 divide-y divide-border">
              {/* Step 1 */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                    1
                  </span>
                  <h2 className="text-xl font-bold">Select your LLM</h2>
                </div>
                <ModelSelect
                  models={llmModels}
                  selectedModelId={selectedModel?.id}
                  onModelSelect={handleModelSelect}
                  className="w-full"
                  triggerClassName="neo-input w-full p-4 text-lg hover:border-primary/50 transition-colors"
                  placeholder="Choose a model from our list"
                />
              </div>

              {/* Step 2 */}
              <div className="space-y-4 pt-8">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                    2
                  </span>
                  <h2 className="text-xl font-bold">Check your system</h2>
                </div>
                <div className="space-y-2">
                  <Button
                    className="neo-button w-full text-lg py-6 bg-primary hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSystemCheck}
                    disabled={!selectedModel}
                  >
                    <span>
                      {selectedModel
                        ? "Can You Run This AI?"
                        : "Please select a model first"}
                    </span>
                  </Button>
                  {lastChecked && (
                    <p className="text-sm text-muted-foreground text-center">
                      Last system check:{" "}
                      {new Date(lastChecked).toLocaleString(undefined, {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Results Section */}
      <section className="bg-muted/30 py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* System Info */}
          <div className="space-y-6" id="system-requirements">
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

          {/* Model Requirements */}
          <div id="model-requirements" className="space-y-6">
            <SystemRequirements />
          </div>
        </div>
      </section>

      <StatusOverlay />
    </div>
  );
}
