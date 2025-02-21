"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Info } from "lucide-react";
import type { SystemInfo } from "@/app/components/SystemChecker";
import { GPUSelector } from "@/app/components/GPUSelector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react"; // For success/error icons

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
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({}); // Error state
  const [isSubmitted, setIsSubmitted] = useState(false); // Submission state

  useEffect(() => {
    const stored = getStoredSystemInfo();
    if (stored) {
      setFormData(stored);
      setIsSubmitted(true); // Assume submitted if data is loaded
    }
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

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.GPU) errors.GPU = "Please select a GPU.";
    if (!formData.RAM || parseFloat(formData.RAM) <= 0)
      errors.RAM = "Please enter a valid RAM amount.";
    if (!formData.Storage || parseFloat(formData.Storage) <= 0)
      errors.Storage = "Please enter a valid storage amount.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleSubmit = () => {
    if (validateForm()) {
      storeSystemInfo(formData);
      const timestamp = new Date().toISOString();
      setIsSubmitted(true); // Set submission state
      document
        .getElementById("system-requirements")
        ?.scrollIntoView({ behavior: "smooth" });
      onSubmit(formData, timestamp);
    }
  };

  const handleReset = () => {
    setFormData({ RAM: "", GPU: "", VRAM: "", Storage: "" });
    setFormErrors({});
    setIsSubmitted(false);
    if (isProd) {
      Cookies.remove("systemInfo");
    } else {
      localStorage.removeItem("systemInfo");
    }
  };

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Can You Run This AI Locally?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find out if your hardware meets the requirements to run the latest
            LLM models.
          </p>
        </div>

        <Card className="border-2 shadow-lg rounded-xl">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Enter Your System Specs
              </CardTitle>
              <CardDescription className="text-base">
                We will check compatibility instantly.
              </CardDescription>
            </div>
            {isSubmitted && (
              <div className="flex items-center gap-2 text-sm font-medium text-green-500 dark:text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
                <CheckCircle2 className="h-5 w-5" />
                Data saved with {formData.GPU} ({formData.VRAM})
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            <TooltipProvider>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* GPU Selector */}
                  <div className="space-y-2 md:col-span-2">
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
                    {formErrors.GPU && (
                      <p className="text-sm text-red-500">{formErrors.GPU}</p>
                    )}
                  </div>

                  {/* RAM Input */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      System RAM
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Total available system memory
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={(formData.RAM || "").split(" ")[0] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (parseFloat(value) >= 0 || value === "") {
                            setFormData((prev) => ({
                              ...prev,
                              RAM: value === "" ? "" : `${value} GB`,
                            }));
                          }
                        }}
                        placeholder="16"
                        className="flex-1"
                        min="0"
                      />
                      <span className="text-sm text-muted-foreground">GB</span>
                    </div>
                    {formErrors.RAM && (
                      <p className="text-sm text-red-500">{formErrors.RAM}</p>
                    )}
                  </div>

                  {/* Storage Input */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      Available Storage
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            SSD storage for model weights
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={(formData.Storage || "").split(" ")[0] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (parseFloat(value) >= 0 || value === "") {
                            setFormData((prev) => ({
                              ...prev,
                              Storage: value === "" ? "" : `${value} GB`,
                            }));
                          }
                        }}
                        placeholder="256"
                        className="flex-1"
                        min="0"
                      />
                      <span className="text-sm text-muted-foreground">GB</span>
                    </div>
                    {formErrors.Storage && (
                      <p className="text-sm text-red-500">
                        {formErrors.Storage}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="w-28"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !formData.GPU || !formData.RAM || !formData.Storage
                    }
                    variant="default"
                    className="w-36"
                  >
                    Analyze System
                  </Button>
                </div>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
