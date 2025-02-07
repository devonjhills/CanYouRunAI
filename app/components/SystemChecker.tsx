"use client";

import React from "react";
import { LLMModel } from "@/app/data/llm-models";
import { Cpu, MemoryStick, MonitorCog, HardDrive } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelSelect } from "@/app/components/ModelSelect";

export interface SystemInfo {
  CPU: string;
  RAM: string;
  GPU: string;
  VRAM: string;
  Storage: string;
}

interface SystemCheckerProps {
  systemInfo?: SystemInfo;
  comparisonModel?: LLMModel;
  models: LLMModel[];
  onModelSelect: (modelId: string) => void;
  lastChecked?: string | null;
}

function compareRAMorVRAM(actual: string, required: string): boolean {
  if (actual === "Unknown") return false;
  const actualGB = parseFloat(actual.split(" ")[0]);
  const requiredGB = parseFloat(required.split(" ")[0]);
  return actualGB >= requiredGB;
}

export function SystemChecker({
  systemInfo,
  comparisonModel,
  models,
  onModelSelect,
  lastChecked,
}: SystemCheckerProps) {
  return (
    <Card className="w-full overflow-hidden" id="system-requirements">
      <div className="border-b bg-muted/50 px-6 py-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          System Requirements Check
        </h2>
      </div>

      <Tabs defaultValue="comparison" className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comparison">
              Requirements Comparison
            </TabsTrigger>
            <TabsTrigger value="my-system">My Computer Details</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="comparison">
          <div className="p-6 pt-4 space-y-6">
            <div className="flex justify-end">
              <ModelSelect
                models={models}
                selectedModelId={comparisonModel?.id}
                onModelSelect={onModelSelect}
              />
            </div>

            <div className="flex gap-8 mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground/90">
                  Your System
                </h3>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground/90">
                  {comparisonModel?.name || "Select a model to view"}{" "}
                  Requirements
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: <Cpu className="w-5 h-5 text-primary" />,
                  label: "CPU",
                  value: systemInfo?.CPU || "Unknown",
                  isValid: systemInfo?.CPU !== "Unknown",
                  requirement: comparisonModel?.requirements.CPU || "N/A",
                },
                {
                  icon: <MemoryStick className="w-5 h-5 text-primary" />,
                  label: "RAM",
                  value: systemInfo?.RAM || "Unknown",
                  isValid:
                    systemInfo?.RAM &&
                    comparisonModel?.requirements.RAM &&
                    compareRAMorVRAM(
                      systemInfo.RAM,
                      comparisonModel.requirements.RAM,
                    ),
                  requirement: comparisonModel?.requirements.RAM || "N/A",
                },
                {
                  icon: <MonitorCog className="w-5 h-5 text-primary" />,
                  label: "GPU",
                  value: systemInfo?.GPU || "Unknown",
                  isValid: systemInfo?.GPU !== "Unknown",
                  requirement: comparisonModel?.requirements.GPU || "N/A",
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
                  requirement: comparisonModel?.requirements.VRAM || "N/A",
                },
                {
                  icon: <HardDrive className="w-5 h-5 text-primary" />,
                  label: "Storage",
                  value: systemInfo?.Storage || "Unknown",
                  isValid: systemInfo?.Storage !== "Unknown",
                  requirement: comparisonModel?.requirements.Storage || "N/A",
                },
              ].map((spec) => (
                <div key={spec.label} className="flex gap-4">
                  <div
                    className={`flex-1 flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      spec.isValid
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    {spec.icon}
                    <span className="text-muted-foreground font-medium">
                      {spec.label}:
                    </span>
                    <span
                      className={`font-medium ${
                        spec.isValid ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {spec.value}
                    </span>
                  </div>
                  <div
                    className={`flex-1 flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      spec.isValid
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    {spec.icon}
                    <span className="text-muted-foreground font-medium">
                      {spec.label}:
                    </span>
                    <span className="font-medium">{spec.requirement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-system">
          <div className="p-6 pt-4">
            {systemInfo ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Cpu className="w-6 h-6 text-primary" />,
                      label: "CPU",
                      value: systemInfo.CPU,
                    },
                    {
                      icon: <MemoryStick className="w-6 h-6 text-primary" />,
                      label: "RAM",
                      value: systemInfo.RAM,
                    },
                    {
                      icon: <MonitorCog className="w-6 h-6 text-primary" />,
                      label: "GPU",
                      value: systemInfo.GPU,
                    },
                    {
                      icon: <HardDrive className="w-6 h-6 text-primary" />,
                      label: "VRAM",
                      value: systemInfo.VRAM,
                    },
                    {
                      icon: <HardDrive className="w-6 h-6 text-primary" />,
                      label: "Storage",
                      value: systemInfo.Storage,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="mt-1">{item.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground/90">
                          {item.label}
                        </h3>
                        <p className="text-lg break-words text-foreground/80">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {lastChecked
                    ? `Last checked: ${new Date(lastChecked).toLocaleString(
                        undefined,
                        {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}`
                    : "Last checked: Unknown"}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No system information available. Please run the system check
                tool.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
