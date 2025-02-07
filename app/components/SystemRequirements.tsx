"use client";

import { useState } from "react";
import { modelCategories, llmModels } from "@/app/data/llm-models";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Cpu, MemoryStick, MonitorCog, HardDrive, Monitor } from "lucide-react";

export const SystemRequirements = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredModels = llmModels.filter((model) => {
    switch (selectedCategory) {
      case "popular":
        // Models that are more accessible in terms of requirements
        return ["llama2-7b", "phi-4", "gemma2-9b", "mixtral-8x7b"].includes(
          model.id,
        );

      case "cpu-only":
        // More accurate CPU-only check
        const gpuReq = model.requirements.GPU.toLowerCase();
        return (
          !gpuReq.includes("nvidia") &&
          !gpuReq.includes("rtx") &&
          !gpuReq.includes("gtx")
        );

      case "high-end":
        // Based on actual high resource requirements
        const ramReq = parseFloat(model.requirements.RAM.split(" ")[0]);
        const vramReq = parseFloat(model.requirements.VRAM.split(" ")[0]);
        return ramReq >= 64 || vramReq >= 24;

      case "coding":
        // Models optimized for code generation
        return (
          model.description.toLowerCase().includes("cod") ||
          ["codestral-mamba", "deepseek-v3", "phi-4"].includes(model.id)
        );

      case "multilingual":
        // Models with multilingual capabilities
        return (
          model.description.toLowerCase().includes("multilingual") ||
          ["bloom-176b", "llama3-1-405b", "qwen2-72b"].includes(model.id)
        );

      default:
        return true;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            LLM System Requirements
          </h2>
          <p className="text-muted-foreground max-w-[700px] mx-auto">
            Compare hardware requirements for different LLM models. Filter by
            category to find the right model for your setup.
          </p>
        </div>

        <div className="flex justify-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {modelCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((model) => (
            <Card
              key={model.id}
              className="hover:shadow-lg transition-shadow flex flex-col"
            >
              <CardHeader className="flex-none">
                <div>
                  <h3 className="text-xl font-bold leading-tight">
                    {model.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {model.description}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <RequirementItem
                    label="CPU"
                    value={model.requirements.CPU}
                    icon={<Cpu className="h-4 w-4 text-primary" />}
                  />
                  <RequirementItem
                    label="RAM"
                    value={model.requirements.RAM}
                    icon={<MemoryStick className="h-4 w-4 text-primary" />}
                  />
                  <RequirementItem
                    label="GPU"
                    value={model.requirements.GPU}
                    icon={<MonitorCog className="h-4 w-4 text-primary" />}
                  />
                  <RequirementItem
                    label="VRAM"
                    value={model.requirements.VRAM}
                    icon={<HardDrive className="h-4 w-4 text-primary" />}
                  />
                  <RequirementItem
                    label="Storage"
                    value={model.requirements.Storage}
                    icon={<Monitor className="h-4 w-4 text-primary" />}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

const RequirementItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <span className="text-sm text-muted-foreground break-words pl-6">
        {value}
      </span>
    </div>
    <Separator />
  </div>
);
