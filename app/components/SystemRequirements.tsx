"use client";

import React, { useState } from "react";
import { llmModels, modelCategories } from "@/app/data/llm-models";

export const SystemRequirements = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredModels = llmModels.filter(
    (model) =>
      (selectedCategory === "all" || model.category === selectedCategory) &&
      (!searchQuery ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      {/* Search & Category Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            className="neo-input w-full"
          />
          {isDropdownOpen && searchQuery && (
            <div className="absolute z-10 w-full mt-1 neo-brutalist-shadow bg-popover border-2 border-foreground">
              {filteredModels.map((model) => (
                <div
                  key={model.id}
                  className="p-3 cursor-pointer hover:bg-accent text-popover-foreground"
                  onClick={() => {
                    setSearchQuery(model.name);
                    setIsDropdownOpen(false);
                  }}
                >
                  {model.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {modelCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-[--radius] text-sm font-medium transition ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requirements Display */}
      <div className="grid grid-cols-1 gap-6">
        {filteredModels.map((model) => (
          <div key={model.id} className="neo-card">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              {model.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
              {/* Left Column */}
              <div className="space-y-2">
                <div>
                  <span className="font-bold">CPU:</span>{" "}
                  {model.requirements.cpu}
                </div>
                <div>
                  <span className="font-bold">RAM:</span>{" "}
                  {model.requirements.ram}
                </div>
                <div>
                  <span className="font-bold">GPU:</span>{" "}
                  {model.requirements.gpu}
                </div>
              </div>
              {/* Right Column */}
              <div className="space-y-2">
                <div>
                  <span className="font-bold">Storage:</span>{" "}
                  {model.requirements.storage}
                </div>
                <div>
                  <span className="font-bold">OS:</span> {model.requirements.os}
                </div>
                <div>
                  <span className="font-bold">Notes:</span>{" "}
                  {model.requirements.notes}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
