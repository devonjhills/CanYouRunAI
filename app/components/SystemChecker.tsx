"use client";

import React, { useState } from "react";
import { LLMModel } from "@/app/data/llm-models";
import {
  Cpu,
  MemoryStick,
  MonitorCog,
  HardDrive,
  Monitor,
  X as XIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SystemInfo {
  CPU: string;
  RAM: string;
  GPU: string;
  VRAM: string;
  OS: string;
}

interface SystemCheckerProps {
  systemInfo?: SystemInfo;
  comparisonModel?: LLMModel;
  models: LLMModel[];
  onModelSelect: (modelId: string) => void;
}

function compareRAMorVRAM(actual: string, required: string): boolean {
  if (actual === "Unknown") return false;
  const actualGB = parseFloat(actual.split(" ")[0]);
  const requiredGB = parseFloat(required.split(" ")[0]);
  return actualGB >= requiredGB;
}

function compareOS(actual: string, required: string): boolean {
  if (actual === "Unknown") return false;
  const actualMatch = actual.toLowerCase().match(/windows (\d+)/);
  const requiredMatch = required.toLowerCase().match(/windows (\d+)/);
  if (actualMatch && requiredMatch) {
    const actualVersion = parseInt(actualMatch[1]);
    const requiredVersion = parseInt(requiredMatch[1]);
    return actualVersion >= requiredVersion;
  }
  return actual.toLowerCase() === required.toLowerCase();
}

export function SystemChecker({
  systemInfo,
  comparisonModel,
  models,
  onModelSelect,
}: SystemCheckerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6" id="system-requirements">
      <h2 className="text-3xl font-bold text-center mb-8">
        System Requirements Check
      </h2>
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparison">Requirements Comparison</TabsTrigger>
          <TabsTrigger value="my-system">My Computer Details</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex justify-end">
                <Select
                  value={comparisonModel?.id}
                  onValueChange={onModelSelect}
                  open={isOpen}
                  onOpenChange={setIsOpen}
                >
                  <SelectTrigger className="neo-input w-[280px]">
                    <SelectValue placeholder="Select model to compare" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Models</SelectLabel>
                      <div className="relative">
                        <div className="relative">
                          <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8"
                            placeholder="Search models..."
                            value={searchQuery}
                            onChange={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSearchQuery(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            autoComplete="off"
                          />
                          {searchQuery && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSearchQuery("");
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <XIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {filteredModels.map((model) => (
                        <SelectItem
                          key={model.id}
                          value={model.id}
                          onSelect={(e) => {
                            e.preventDefault();
                            onModelSelect(model.id);
                            setIsOpen(false);
                            setSearchQuery("");
                          }}
                        >
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
                    icon: <Monitor className="w-5 h-5 text-primary" />,
                    label: "OS",
                    value: systemInfo?.OS || "Unknown",
                    isValid:
                      systemInfo?.OS &&
                      comparisonModel?.requirements.OS &&
                      compareOS(systemInfo.OS, comparisonModel.requirements.OS),
                    requirement: comparisonModel?.requirements.OS || "N/A",
                  },
                ].map((spec) => (
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
                      <p className="text-lg break-words">{systemInfo.CPU}</p>
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
                      <p className="text-lg break-words">{systemInfo.GPU}</p>
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
                No system information available. Please run the system check
                tool.
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
