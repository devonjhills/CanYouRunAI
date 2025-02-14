"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Info } from "lucide-react";
import type { SystemInfo } from "@/app/components/SystemChecker";
import { GPUSelector } from "@/app/components/GPUSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const isProd = process.env.NODE_ENV === "production";

interface LLMCompatibilityCheckerProps {
  onSubmit: (systemInfo: SystemInfo, timestamp: string) => void;
  initialData?: SystemInfo;
}

export default function LLMCompatibilityChecker({
  onSubmit,
  initialData,
}: LLMCompatibilityCheckerProps) {
  const [formData, setFormData] = useState<SystemInfo>(
    initialData || { RAM: "", GPU: "", VRAM: "", Storage: "" },
  );

  useEffect(() => {
    const stored = getStoredSystemInfo();
    if (stored) setFormData(stored);
  }, []);

  const storeSystemInfo = (info: SystemInfo) => {
    const storageData = { ...info, lastChecked: new Date().toISOString() };
    if (isProd) {
      Cookies.set("systemInfo", JSON.stringify(storageData), { expires: 30 });
    } else {
      localStorage.setItem("systemInfo", JSON.stringify(storageData));
    }
  };

  const getStoredSystemInfo = (): SystemInfo | null => {
    const savedInfo = isProd
      ? Cookies.get("systemInfo")
      : localStorage.getItem("systemInfo");
    return savedInfo ? JSON.parse(savedInfo) : null;
  };

  const handleSubmit = () => {
    storeSystemInfo(formData);
    const timestamp = new Date().toISOString();
    document
      .getElementById("system-requirements")
      ?.scrollIntoView({ behavior: "smooth" });
    onSubmit(formData, timestamp);
  };

  return (
    <Card className="p-6 space-y-6">
      <TooltipProvider>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">System Compatibility Check</h1>
          <p className="text-sm text-muted-foreground">
            Enter your hardware specifications to check supported LLM models
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* GPU Selector */}
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-1.5">
                Graphics Card
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Select your primary GPU model</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <GPUSelector
                onSelect={(gpu) =>
                  setFormData((prev) => ({
                    ...prev,
                    GPU: gpu.GPU,
                    VRAM: gpu.VRAM,
                    GPUBandwidth: gpu.GPUBandwidth,
                    GPUDetails: gpu.GPUDetails,
                  }))
                }
                selectedModel={formData.GPU}
              />
            </div>

            {/* RAM Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                System RAM
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Total available system memory</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={formData.RAM.split(" ")[0] || ""}
                  onChange={(e) => 
                    setFormData((prev) => ({ ...prev, RAM: `${e.target.value} GB` }))
                  }
                  placeholder="16"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">GB</span>
              </div>
            </div>

            {/* Storage Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                Available Storage
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">SSD storage for model weights</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={formData.Storage.split(" ")[0] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, Storage: `${e.target.value} GB` }))
                  }
                  placeholder="256"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">GB</span>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!formData.GPU || !formData.RAM || !formData.Storage}
          >
            Analyze System
          </Button>
        </div>
      </TooltipProvider>
    </Card>
  );
}