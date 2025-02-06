"use client";

import { useState } from "react";
import { modelCategories, llmModels } from "@/app/data/llm-models";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="space-y-6">
      <div className="flex justify-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
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

      <div className="grid gap-6 md:grid-cols-2">
        {filteredModels.map((model) => (
          <Card key={model.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{model.name}</h3>
                <p className="text-muted-foreground">{model.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">CPU:</span>
                  <span className="text-muted-foreground">
                    {model.requirements.CPU}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">RAM:</span>
                  <span className="text-muted-foreground">
                    {model.requirements.RAM}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">GPU:</span>
                  <span className="text-muted-foreground">
                    {model.requirements.GPU}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">VRAM:</span>
                  <span className="text-muted-foreground">
                    {model.requirements.VRAM}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">OS:</span>
                  <span className="text-muted-foreground">
                    {model.requirements.OS}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
