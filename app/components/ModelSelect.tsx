"use client";

import React, { useState } from "react";
import { LLMModel } from "@/app/data/llm-models";
import { X as XIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelSelectProps {
  models: LLMModel[];
  selectedModelId?: string;
  onModelSelect: (modelId: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function ModelSelect({
  models,
  selectedModelId,
  onModelSelect,
  placeholder = "Select model to compare",
  className = "w-[280px]",
  triggerClassName = "", // Remove default styling here
}: ModelSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Combine default and custom trigger styles.  This is important!
  const combinedTriggerClassName = `
    border-2
    border-primary  // Use a more prominent border color
    focus:ring-2
    focus:ring-primary/50 // Use primary color for the focus ring
    focus:border-primary   // Keep focus border as primary
    rounded-md            // Ensure rounded corners
    w-full               // Full width within the container
    ${triggerClassName}   // Apply any custom styles from props
  `;

  return (
    <div className={className}>
      <Select
        value={selectedModelId}
        onValueChange={onModelSelect}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className={combinedTriggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-50">
          {" "}
          {/* Add z-index for proper layering */}
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
  );
}
