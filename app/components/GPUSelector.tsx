import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { GPUSpecs } from '@/app/data/gpu-db';

interface GPUSelectorProps {
  onSelect: (gpu: GPUSpecs) => void;
  selectedModel?: string;
}

export function GPUSelector({ onSelect, selectedModel }: GPUSelectorProps) {
  const [search, setSearch] = useState("");
  const [gpus, setGpus] = useState<GPUSpecs[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGPU, setSelectedGPU] = useState<GPUSpecs | null>(null);

  useEffect(() => {
    if (selectedModel && !selectedGPU) {
      fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/gpus/search?q=${encodeURIComponent(selectedModel)}`)
        .then(async res => {
          if (!res.ok) throw new Error('Failed to load GPU data');
          const data = await res.json();
          const gpu = Array.isArray(data) ? data.find(g => g.key === selectedModel) : null;
          if (gpu) {
            setSelectedGPU(gpu);
          }
        })
        .catch(err => {
          console.error('Error loading selected GPU:', err);
        });
    }
  }, [selectedModel, selectedGPU]);

  useEffect(() => {
    if (search.trim()) {
      setIsLoading(true);
      setError(null);
      
      const debounceTimer = setTimeout(() => {
        fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/gpus/search?q=${encodeURIComponent(search)}`)
          .then(async res => {
            if (!res.ok) throw new Error('Failed to load GPU data');
            const data = await res.json();
            const uniqueGPUs = Array.isArray(data) 
              ? data.filter((gpu, index, self) => 
                  index === self.findIndex(g => g.key === gpu.key)
                )
              : [];
            setGpus(uniqueGPUs);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Error loading GPUs:', err);
            setError(err.message || 'Failed to load GPU data');
            setGpus([]);
            setIsLoading(false);
          });
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setGpus([]);
    }
  }, [search]);

  return (
    <Card className="w-full">
      <div className="p-4">
        <Label>GPU Model</Label>
        <Command shouldFilter={false} className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Search GPUs..."
            value={search}
            onValueChange={setSearch}
          />
          {search.length > 0 && (
            isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-red-500">{error}</div>
            ) : gpus.length > 0 ? (
              <CommandList>
                {gpus.map((gpu) => (
                  <CommandItem
                    key={gpu.key}
                    onSelect={() => {
                      setSelectedGPU(gpu);
                      onSelect(gpu);
                      setSearch("");
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between w-full items-center">
                      <span className={gpu.key === selectedModel ? "font-bold" : ""}>
                        {gpu.Model}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {gpu.vram}GB VRAM
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            )
          )}
        </Command>

        {selectedModel && selectedGPU && (
          <div className="pt-2">
            <Badge variant="outline" className="gap-2 py-2 px-4">
              <Check className="h-4 w-4 text-green-500" />
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
