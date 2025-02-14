"use client";

import { llmModels } from "@/app/data/llm-models";
import { useEffect, useState } from "react";
import { LLMModel } from "@/app/data/llm-models";
import { SystemInfo, SystemChecker } from "@/app/components/SystemChecker";
import Cookies from "js-cookie";
import type { SystemSpecs, AdvancedAnalysis } from "./data/llm-models";
import { AdvancedAnalysisSection } from "./components/AdvancedAnalysis";
import LLMCompatibilityChecker from "./components/LLMCompatibilityChecker";

const isProd = process.env.NODE_ENV === "production";

// URL for the quantize worker; fallback to placeholder if not set.
const QUANTIZE_WORKER_URL =
  process.env.NEXT_PUBLIC_QUANTIZE_WORKER_URL ||
  "https://canyourunai-quantize.digitalveilmedia.workers.dev";

export default function Home() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | undefined>(
    undefined,
  );
  const [comparisonModel, setComparisonModel] = useState<LLMModel | undefined>(
    undefined,
  );
  const [analysis, setAnalysis] = useState<AdvancedAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
            : 0,
        vramPerGpu:
          systemInfo?.VRAM && systemInfo.VRAM !== "Unknown"
            ? parseFloat(systemInfo.VRAM.split(" ")[0])
            : 0,
        numGpus: 1,
        gpuBrand:
          systemInfo?.GPU && systemInfo.GPU !== "Unknown" ? systemInfo.GPU : "",
        gpuBandwidth: systemInfo?.GPUBandwidth || 0,
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
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <LLMCompatibilityChecker
            onSubmit={(info: SystemInfo, timestamp: string) => {
              setSystemInfo(info);
              setLastChecked(timestamp);
            }}
          />

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
          </div>
        </div>
      </section>
    </div>
  );
}
