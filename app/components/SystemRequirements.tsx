'use client';

import React, { useState } from 'react';

const llmRequirements = [
  {
    name: 'LLaMA 2 (7B)',
    category: 'popular',
    requirements: {
      cpu: 'Modern multi-core CPU (AMD Ryzen 5/Intel i5 or better)',
      ram: '16GB minimum, 32GB recommended',
      gpu: 'NVIDIA GPU with 8GB VRAM (RTX 3060 or better)',
      storage: '20GB free space',
      os: 'Windows 10/11, Linux, macOS',
      notes: 'Quantized 4-bit version available for lower requirements',
    },
  },
  {
    name: 'GPT4All-J',
    category: 'cpu-only',
    requirements: {
      cpu: 'x86 64-bit CPU (AMD/Intel)',
      ram: '8GB minimum',
      gpu: 'Not required - CPU only',
      storage: '10GB free space',
      os: 'Windows 10/11, Linux, macOS',
      notes: 'Optimized for CPU inference',
    },
  },
  {
    name: 'Falcon (7B)',
    category: 'popular',
    requirements: {
      cpu: 'AMD Ryzen 7/Intel i7 or better',
      ram: '32GB recommended',
      gpu: 'NVIDIA GPU with 12GB VRAM (RTX 3060 Ti or better)',
      storage: '25GB free space',
      os: 'Windows 10/11, Linux',
      notes: 'Supports 4-bit quantization for reduced requirements',
    },
  },
  {
    name: 'BLOOM (7B)',
    category: 'high-end',
    requirements: {
      cpu: 'Modern 8-core CPU',
      ram: '32GB minimum',
      gpu: 'NVIDIA GPU with 16GB VRAM (RTX 3080 or better)',
      storage: '30GB free space',
      os: 'Linux recommended, Windows 10/11',
      notes: 'INT8 quantized version available',
    },
  },
  {
    name: 'MPT-7B',
    category: 'popular',
    requirements: {
      cpu: 'AMD Ryzen 5/Intel i5 or better',
      ram: '16GB minimum',
      gpu: 'NVIDIA GPU with 8GB VRAM',
      storage: '15GB free space',
      os: 'Windows 10/11, Linux, macOS',
      notes: 'Supports various quantization methods',
    },
  },
  {
    name: 'Pythia (7B)',
    category: 'popular',
    requirements: {
      cpu: '8-core CPU',
      ram: '16GB minimum, 32GB recommended',
      gpu: 'NVIDIA GPU with 8GB VRAM',
      storage: '20GB free space',
      os: 'Windows 10/11, Linux',
      notes: 'Good performance with 8-bit quantization',
    },
  },
];

const categories = [
  { id: 'all', label: 'All Models' },
  { id: 'popular', label: 'Popular' },
  { id: 'cpu-only', label: 'CPU Only' },
  { id: 'high-end', label: 'High-End' },
];

export const SystemRequirements = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredModels = llmRequirements.filter(
    (model) =>
      (selectedCategory === 'all' || model.category === selectedCategory) &&
      (!searchQuery || model.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
            className="w-full p-3 border border-input bg-background rounded-[--radius] shadow-sm focus:ring-2 focus:ring-ring focus:outline-none text-foreground"
          />
          {isDropdownOpen && searchQuery && (
            <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-[--radius] shadow-lg">
              {filteredModels.map((model) => (
                <div
                  key={model.name}
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
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-[--radius] text-sm font-medium transition ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requirements Display */}
      <div className="grid grid-cols-1 gap-6">
        {filteredModels.map((llm) => (
          <div key={llm.name} className="p-6 bg-card text-card-foreground shadow-lg border border-border rounded-[--radius]">
            <h3 className="text-2xl font-bold mb-4 text-foreground">{llm.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
              {/* Left Column */}
              <div className="space-y-2">
                <div><span className="font-bold">CPU:</span> {llm.requirements.cpu}</div>
                <div><span className="font-bold">RAM:</span> {llm.requirements.ram}</div>
                <div><span className="font-bold">GPU:</span> {llm.requirements.gpu}</div>
              </div>
              {/* Right Column */}
              <div className="space-y-2">
                <div><span className="font-bold">Storage:</span> {llm.requirements.storage}</div>
                <div><span className="font-bold">OS:</span> {llm.requirements.os}</div>
                <div><span className="font-bold">Notes:</span> {llm.requirements.notes}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};