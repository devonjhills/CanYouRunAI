import React, { useState } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { CPUSpecs, cpuDatabase } from "@/app/data/hardware-db";

interface CPUSelectorProps {
  onSelect: (cpu: CPUSpecs) => void;
  selectedModel?: string;
}

export function CPUSelector({ onSelect, selectedModel }: CPUSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredCPUs = cpuDatabase.filter((cpu) =>
    cpu.model.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedCPU = cpuDatabase.find((cpu) => cpu.model === selectedModel);

  return (
    <Card className="w-full">
      <div className="p-4">
        <Label>CPU Model</Label>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search CPUs..."
            value={search}
            onValueChange={setSearch}
          />
          {search.length > 0 &&
            (filteredCPUs.length > 0 ? (
              <CommandList>
                {filteredCPUs.map((cpu) => (
                  <CommandItem
                    key={cpu.model}
                    onSelect={() => {
                      onSelect(cpu);
                      setSearch("");
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between w-full items-center">
                      <span
                        className={
                          cpu.model === selectedModel ? "font-bold" : ""
                        }
                      >
                        {cpu.model}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {cpu.cores} cores
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ))}
        </Command>

        {selectedCPU && (
          <div className="pt-2">
            <Badge variant="outline" className="gap-2 py-2 px-4">
              <Check className="h-4 w-4 text-green-500" />
              <span className="font-medium">{selectedCPU.model}</span>
              <span className="text-muted-foreground">
                ({selectedCPU.cores} cores)
              </span>
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
