import React, { useState, useEffect, useMemo } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { GPUSpecs } from "@/app/data/gpu-db";
import { SystemInfo } from "./SystemChecker";

interface GPUSelectorProps {
  onSelect: (gpu: SystemInfo) => void;
  selectedModel?: string;
}

export function GPUSelector({ onSelect, selectedModel }: GPUSelectorProps) {
  const [search, setSearch] = useState("");
  const [allGpus, setAllGpus] = useState<GPUSpecs[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGPU, setSelectedGPU] = useState<GPUSpecs | null>(null);

  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;

  // Fetch all GPUs once on component mount
  useEffect(() => {
    if (workerUrl) {
      setIsLoading(true);
      fetch(`${workerUrl}/gpus`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          setAllGpus(data as GPUSpecs[]);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading GPUs:", err);
          setError("Failed to load GPU data. Please try again later.");
          setIsLoading(false);
        });
    }
  }, [workerUrl]);

  // Local search filtering
  const filteredGpus = useMemo(() => {
    if (!search.trim()) return [];
    const searchLower = search.toLowerCase();
    return allGpus
      .filter(
        (gpu) =>
          gpu.Model?.toLowerCase().includes(searchLower) ||
          gpu.Vendor?.toLowerCase().includes(searchLower),
      )
      .slice(0, 50); // Limit results for better performance
  }, [search, allGpus]);

  // Set initial selected GPU
  useEffect(() => {
    if (selectedModel && !selectedGPU && allGpus.length > 0) {
      const gpu = allGpus.find((g) => g.key === selectedModel);
      if (gpu) {
        setSelectedGPU(gpu);
      }
    }
  }, [selectedModel, selectedGPU, allGpus]);

  const handleGPUSelect = (gpu: GPUSpecs) => {
    console.log("Selected GPU Data:", {
      rawGpu: gpu,
      formattedGpu: {
        GPU: gpu.Model,
        VRAM: `${gpu.vram} GB`,
        GPUBandwidth:
          typeof gpu["Memory Bandwidth (GB/s)"] === "string"
            ? parseFloat(gpu["Memory Bandwidth (GB/s)"])
            : gpu["Memory Bandwidth (GB/s)"] || 0,
        GPUDetails: {
          codeName: gpu["Code name"]?.toString(),
          busInterface: gpu["Bus interface"]?.toString(),
          memoryBusType: gpu["Memory Bus type"]?.toString(),
          memoryBusWidth: gpu["Memory Bus width (bit)"]?.toString(),
          tdp: gpu["TDP (Watts)"]?.toString(),
          process: gpu["Process"]?.toString(),
          baseCoreClock: gpu["Clock speeds Base core clock (MHz)"]?.toString(),
          boostCoreClock:
            gpu["Clock speeds Boost core clock (MHz)"]?.toString(),
        },
      },
    });

    const selectedGpu: SystemInfo = {
      GPU: gpu.Model,
      VRAM: `${gpu.vram} GB`,
      RAM: "", // Keep existing RAM
      Storage: "", // Keep existing Storage
      GPUBandwidth:
        typeof gpu["Memory Bandwidth (GB/s)"] === "string"
          ? parseFloat(gpu["Memory Bandwidth (GB/s)"])
          : gpu["Memory Bandwidth (GB/s)"] || 0,
      GPUDetails: {
        codeName: gpu["Code name"]?.toString(),
        busInterface: gpu["Bus interface"]?.toString(),
        memoryBusType: gpu["Memory Bus type"]?.toString(),
        memoryBusWidth: gpu["Memory Bus width (bit)"]?.toString(),
        tdp: gpu["TDP (Watts)"]?.toString(),
        process: gpu["Process"]?.toString(),
        baseCoreClock: gpu["Clock speeds Base core clock (MHz)"]?.toString(),
        boostCoreClock: gpu["Clock speeds Boost core clock (MHz)"]?.toString(),
      },
    };
    onSelect(selectedGpu);
    setSelectedGPU(gpu);
    setSearch("");
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-all">
      <div className="p-4">
        <Label>GPU Model</Label>
        <Command shouldFilter={false} className="rounded-lg border shadow-sm">
          <CommandInput
            placeholder="Search GPUs..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                Loading...
              </CommandEmpty>
            ) : error ? (
              <CommandEmpty className="py-6 text-center text-sm text-red-500">
                {error}
              </CommandEmpty>
            ) : filteredGpus.length === 0 && search.length > 0 ? (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No results found
              </CommandEmpty>
            ) : (
              filteredGpus.map((gpu) => (
                <CommandItem
                  key={gpu.key}
                  value={gpu.key}
                  onSelect={() => {
                    handleGPUSelect(gpu);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between w-full items-center">
                    <span
                      className={gpu.key === selectedModel ? "font-bold" : ""}
                    >
                      {gpu.Model}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {gpu.vram}GB VRAM
                    </span>
                  </div>
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>

        {selectedModel && selectedGPU && (
          <div className="pt-2">
            <Badge
              variant="outline"
              className="gap-2 py-2 px-4 bg-secondary/50"
            >
              <Check className="h-4 w-4 text-primary" />
              <span className="font-medium">{selectedGPU.Model}</span>
              <span className="text-muted-foreground">
                ({selectedGPU.vram}GB VRAM)
              </span>
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

export default GPUSelector;
