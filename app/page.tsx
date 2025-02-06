"use client";

import { SystemRequirements } from "./components/SystemRequirements";
import { SystemChecker } from "./components/SystemChecker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { llmModels } from "@/app/data/llm-models";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LLMModel } from "@/app/data/llm-models";
import { SystemInfo } from "@/app/components/SystemChecker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Cookies from "js-cookie";
import { Cpu, MemoryStick, MonitorCog, HardDrive, Monitor } from "lucide-react";

const isProd = process.env.NODE_ENV === "production";

export default function Home() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | undefined>(
    undefined,
  );
  const [selectedModel, setSelectedModel] = useState<LLMModel | undefined>();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    "idle" | "downloading" | "waiting" | "gathering" | "finished"
  >("idle");
  const [comparisonModel, setComparisonModel] = useState<LLMModel | undefined>(
    llmModels[0],
  );

  useEffect(() => {
    // Initial check on page load
    const savedInfo = getStoredSystemInfo();
    if (savedInfo) {
      setSystemInfo(savedInfo);
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

          // Store in localStorage
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
      // Wait 1 seconds before closing the overlay
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleModelSelect = (modelId: string) => {
    const model = llmModels.find((m) => m.id === modelId);
    setSelectedModel(model);
  };

  const WINDOWS_EXE_URL = "/CanYouRunAI.exe";

  const checkStatus = async (sessionId: string) => {
    try {
      const response = await fetch(
        `https://canyourunai-worker.digitalveilmedia.workers.dev/api/system-check?session=${sessionId}`,
      );
      const data = (await response.json()) as {
        success: boolean;
        systemInfo?: SystemInfo;
      };

      if (
        data.success &&
        data.systemInfo &&
        data.systemInfo.CPU &&
        data.systemInfo.RAM &&
        data.systemInfo.GPU &&
        data.systemInfo.VRAM &&
        data.systemInfo.OS
      ) {
        setStatus("finished");
        // Store in localStorage for persistence
        storeSystemInfo(data.systemInfo);
        setSystemInfo({
          CPU: data.systemInfo.CPU,
          RAM: data.systemInfo.RAM,
          GPU: data.systemInfo.GPU,
          VRAM: data.systemInfo.VRAM,
          OS: data.systemInfo.OS,
        });
        const element = document.getElementById("system-requirements");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking status:", error);
      return false;
    }
  };

  const handleSystemCheck = (e: React.MouseEvent) => {
    e.preventDefault();
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
                    ${status === step ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"}`}
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
    if (isProd) {
      // Production: Use cookies
      Cookies.set("systemInfo", JSON.stringify(info), {
        expires: 1, // 1 day
        secure: true,
        sameSite: "none",
      });
    } else {
      // Development: Use localStorage
      localStorage.setItem("systemInfo", JSON.stringify(info));
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

  // Add these helper functions at the top of the file
  const compareRAMorVRAM = (actual: string, required: string): boolean => {
    if (actual === "Unknown") return false;
    const actualGB = parseFloat(actual.split(" ")[0]);
    const requiredGB = parseFloat(required.split(" ")[0]);
    return actualGB >= requiredGB;
  };

  const compareOS = (actual: string, required: string): boolean => {
    if (actual === "Unknown") return false;
    return actual.toLowerCase() === required.toLowerCase();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6">
        <Card className="neo-card max-w-4xl mx-auto mb-12 p-8 md:p-12">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              Can I Run this LLM <span className="text-primary">locally?</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Analyze your computer in seconds.{" "}
              <span className="font-bold text-foreground">100% Free.</span>
            </p>

            {/* Action Steps */}
            <div className="mt-12 space-y-8">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    1
                  </span>
                  <h2 className="text-xl font-bold">Select your LLM</h2>
                </div>
                <Select onValueChange={handleModelSelect}>
                  <SelectTrigger className="neo-input w-full p-4 text-lg">
                    <SelectValue placeholder="Choose a model from our list" />
                  </SelectTrigger>
                  <SelectContent className="neo-brutalist-shadow bg-popover border-2 border-foreground">
                    {llmModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    2
                  </span>
                  <h2 className="text-xl font-bold">Check your system</h2>
                </div>
                <Button
                  className="neo-button w-full text-lg py-6"
                  onClick={handleSystemCheck}
                >
                  <span>Can You Run This AI?</span>
                </Button>
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
            <h2 className="text-3xl font-bold text-center mb-8">
              System Requirements Check
            </h2>
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="comparison">
                  Requirements Comparison
                </TabsTrigger>
                <TabsTrigger value="my-system">My Computer Details</TabsTrigger>
              </TabsList>
              <TabsContent value="comparison">
                <Card className="p-6">
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <Select
                        value={comparisonModel?.id}
                        onValueChange={(id) =>
                          setComparisonModel(llmModels.find((m) => m.id === id))
                        }
                      >
                        <SelectTrigger className="neo-input w-[280px]">
                          <SelectValue placeholder="Select model to compare" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available Models</SelectLabel>
                            {llmModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-8 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">Your System</h3>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {comparisonModel?.name || "Model"} Requirements
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          icon: <Cpu className="w-5 h-5 text-primary" />,
                          label: "CPU",
                          value: systemInfo?.CPU || "Unknown",
                          isValid: systemInfo?.CPU !== "Unknown",
                          requirement:
                            comparisonModel?.requirements.CPU || "N/A",
                        },
                        {
                          icon: (
                            <MemoryStick className="w-5 h-5 text-primary" />
                          ),
                          label: "RAM",
                          value: systemInfo?.RAM || "Unknown",
                          isValid:
                            systemInfo?.RAM &&
                            comparisonModel?.requirements.RAM &&
                            compareRAMorVRAM(
                              systemInfo.RAM,
                              comparisonModel.requirements.RAM,
                            ),
                          requirement:
                            comparisonModel?.requirements.RAM || "N/A",
                        },
                        {
                          icon: <MonitorCog className="w-5 h-5 text-primary" />,
                          label: "GPU",
                          value: systemInfo?.GPU || "Unknown",
                          isValid: systemInfo?.GPU !== "Unknown",
                          requirement:
                            comparisonModel?.requirements.GPU || "N/A",
                        },
                        {
                          icon: <HardDrive className="w-5 h-5 text-primary" />,
                          label: "VRAM",
                          value: systemInfo?.VRAM || "Unknown",
                          isValid:
                            systemInfo?.VRAM &&
                            comparisonModel?.requirements.VRAM &&
                            compareRAMorVRAM(
                              systemInfo.VRAM,
                              comparisonModel.requirements.VRAM,
                            ),
                          requirement:
                            comparisonModel?.requirements.VRAM || "N/A",
                        },
                        {
                          icon: <Monitor className="w-5 h-5 text-primary" />,
                          label: "OS",
                          value: systemInfo?.OS || "Unknown",
                          isValid:
                            systemInfo?.OS &&
                            comparisonModel?.requirements.OS &&
                            compareOS(
                              systemInfo.OS,
                              comparisonModel.requirements.OS,
                            ),
                          requirement:
                            comparisonModel?.requirements.OS || "N/A",
                        },
                      ].map((spec, index) => (
                        <div key={spec.label} className="flex gap-8">
                          <div
                            className={`flex-1 flex items-center space-x-3 p-2 rounded-l ${
                              spec.isValid ? "bg-green-500/10" : "bg-red-500/10"
                            }`}
                          >
                            {spec.icon}
                            <span className="text-muted-foreground">
                              {spec.label}:
                            </span>
                            <span
                              className={
                                spec.isValid ? "text-green-500" : "text-red-500"
                              }
                            >
                              {spec.value}
                            </span>
                          </div>
                          <div
                            className={`flex-1 flex items-center space-x-3 p-2 rounded-r ${
                              spec.isValid ? "bg-green-500/10" : "bg-red-500/10"
                            }`}
                          >
                            {spec.icon}
                            <span className="text-muted-foreground">
                              {spec.label}:
                            </span>
                            <span>{spec.requirement}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="my-system">
                <Card className="p-6">
                  {systemInfo ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                          <Cpu className="w-6 h-6 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">CPU</h3>
                            <p className="text-lg break-words">
                              {systemInfo.CPU}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                          <MemoryStick className="w-6 h-6 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">RAM</h3>
                            <p className="text-lg">{systemInfo.RAM}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                          <MonitorCog className="w-6 h-6 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">GPU</h3>
                            <p className="text-lg break-words">
                              {systemInfo.GPU}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                          <HardDrive className="w-6 h-6 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">VRAM</h3>
                            <p className="text-lg">{systemInfo.VRAM}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                          <Monitor className="w-6 h-6 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">Operating System</h3>
                            <p className="text-lg">{systemInfo.OS}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Last checked: {new Date().toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No system information available. Please run the system
                      check tool.
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Model Requirements */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center mb-8">
              All LLM Requirements
            </h2>
            <SystemRequirements />
          </div>
        </div>
      </section>

      <StatusOverlay />
    </div>
  );
}
