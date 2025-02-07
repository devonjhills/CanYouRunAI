import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cpu, MemoryStick, MonitorCog, HardDrive } from "lucide-react";
import type { SystemInfo } from "./SystemChecker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ManualSpecsEntryProps {
  onSubmit: (info: SystemInfo) => void;
  initialValues?: SystemInfo;
  trigger?: React.ReactNode;
}

export function ManualSpecsEntry({
  onSubmit,
  initialValues,
  trigger,
}: ManualSpecsEntryProps) {
  const [open, setOpen] = useState(false);

  // Parse initial values to remove "GB" and get just the number
  const parseInitialValue = (value: string | undefined) => {
    if (!value || value === "Unknown") return "";
    return value.toLowerCase().replace(" gb", "");
  };

  const [formData, setFormData] = useState({
    CPU: initialValues?.CPU || "",
    RAM: parseInitialValue(initialValues?.RAM),
    GPU: initialValues?.GPU || "",
    VRAM: parseInitialValue(initialValues?.VRAM),
    Storage: parseInitialValue(initialValues?.Storage),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formatSize = (value: string) => {
      if (!value) return "Unknown";
      return `${value.trim()} GB`;
    };

    const updatedInfo: SystemInfo = {
      CPU: formData.CPU.trim() || "Unknown",
      RAM: formatSize(formData.RAM),
      GPU: formData.GPU.trim() || "Unknown",
      VRAM: formatSize(formData.VRAM),
      Storage: formatSize(formData.Storage),
    };

    onSubmit(updatedInfo);
    setOpen(false);
  };

  // Handle numeric input for RAM, VRAM, and Storage
  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    const value = e.target.value;
    // Allow only numbers and empty string
    if (value === "" || /^\d+$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Enter Specs Manually</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter System Specifications</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {/* CPU Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Cpu className="w-4 h-4 text-primary" />
                CPU
              </label>
              <Input
                value={formData.CPU}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, CPU: e.target.value }))
                }
                placeholder="e.g., Intel Core i7-12700K"
                className="neo-input"
              />
            </div>

            {/* GPU Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <MonitorCog className="w-4 h-4 text-primary" />
                GPU
              </label>
              <Input
                value={formData.GPU}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, GPU: e.target.value }))
                }
                placeholder="e.g., NVIDIA RTX 3080"
                className="neo-input"
              />
            </div>

            {/* Numeric Inputs */}
            {[
              {
                icon: <MemoryStick className="w-4 h-4 text-primary" />,
                label: "RAM",
                key: "RAM",
                placeholder: "e.g., 32",
              },
              {
                icon: <HardDrive className="w-4 h-4 text-primary" />,
                label: "VRAM",
                key: "VRAM",
                placeholder: "e.g., 10",
              },
              {
                icon: <HardDrive className="w-4 h-4 text-primary" />,
                label: "Storage",
                key: "Storage",
                placeholder: "e.g., 500",
              },
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  {field.icon}
                  {field.label} (GB)
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={formData[field.key as keyof typeof formData]}
                  onChange={(e) => handleNumericInput(e, field.key)}
                  placeholder={field.placeholder}
                  className="neo-input"
                />
              </div>
            ))}
          </div>
          <Button
            type="submit"
            className="w-full neo-brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Save Specifications
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
