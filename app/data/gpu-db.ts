export interface GPUSpecs {
  key: string;
  Model: string;
  "Code name": string;
  "Memory Size (MiB)": string;
  "Memory Bandwidth (GB/s)": string;
  Vendor: string;
  // Computed fields for compatibility
  model: string;
  architecture: string;
  vram: number;
  bandwidth: number;
  vendor: string;
  // Allow string values for other GPU properties
  [key: string]: string | number;
}

export function searchGPUs(gpus: GPUSpecs[], query: string): GPUSpecs[] {
  const lowercaseQuery = query.toLowerCase();
  return gpus.filter(gpu => 
    gpu.model.toLowerCase().includes(lowercaseQuery) ||
    gpu.architecture.toLowerCase().includes(lowercaseQuery)
  );
} 