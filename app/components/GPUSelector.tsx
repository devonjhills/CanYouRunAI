import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
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

  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
  if (!workerUrl) {
    console.error('Worker URL is not configured');
  }

  useEffect(() => {
    if (selectedModel && !selectedGPU && workerUrl) {
      fetch(`${workerUrl}/gpus/search?q=${encodeURIComponent(selectedModel)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
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
        setError(err.message || 'Failed to load GPU data');
      });
    }
  }, [selectedModel, selectedGPU, workerUrl]);

  useEffect(() => {
    if (search.trim() && workerUrl) {
      setIsLoading(true);
      setError(null);
      
      const debounceTimer = setTimeout(() => {
        fetch(`${workerUrl}/gpus/search?q=${encodeURIComponent(search)}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
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
  }, [search, workerUrl]);

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
            ) : gpus.length === 0 && search.length > 0 ? (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No results found
              </CommandEmpty>
            ) : (
              gpus.map((gpu) => (
                <CommandItem
                  key={gpu.key}
                  value={gpu.key}
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
              ))
            )}
          </CommandList>
        </Command>

        {selectedModel && selectedGPU && (
          <div className="pt-2">
            <Badge variant="outline" className="gap-2 py-2 px-4 bg-secondary/50">
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