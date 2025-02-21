export interface LLMRequirements {
  RAM: string;
  GPU: string;
  VRAM: string;
  Storage: string;
  GPUBandwidth?: string;
}

export interface LLMModel {
  id: string;
  name: string;
  description: string;
  requirements: LLMRequirements;
  requiredRAM: string;
  requiredVRAM: string;
  recommendedGPU: string;
}

export const modelCategories = [
  { id: "all", label: "All Models" },
  { id: "popular", label: "Popular" },
  { id: "high-end", label: "High-End" },
  { id: "coding", label: "Coding" },
  { id: "multilingual", label: "Multilingual" },
] as const;

export interface QuantizationLevel {
  name: string;
  bpw: number; // Bits per weight
}

export const QUANTIZATION_LEVELS: QuantizationLevel[] = [
  { name: "fp8", bpw: 8.0 },
  { name: "q6_k_s", bpw: 6.6 },
  { name: "q5_k_s", bpw: 5.5 },
  { name: "q4_k_m", bpw: 4.8 },
  { name: "IQ4_XS", bpw: 4.3 },
  { name: "q3_k_m", bpw: 3.9 },
  { name: "IQ3_XS", bpw: 3.3 },
  { name: "IQ2_XS", bpw: 2.4 },
];

export interface SystemSpecs {
  totalRam: number;
  vramPerGpu: number;
  numGpus: number;
  gpuBrand?: string;
  gpuBandwidth: number;
}

export interface ModelAnalysis {
  runType: string;
  memoryRequired: number;
  offloadPercentage: number;
  tokensPerSecond: number | null;
  maxContext: number | null;
}

interface ModelSummary {
  description: string | null;
}

export interface ModelConfig {
  architecture: string;
  contextLength: number;
  parameterSize: string;
}

export interface AdvancedAnalysis {
  modelConfig: ModelConfig;
  modelParams: number;
  modelSummary: ModelSummary;
  systemSpecs: SystemSpecs;
  quantizationResults: Record<string, ModelAnalysis>;
  usingPlaceholders?: boolean;
  modelSizeGb: number | null;
}
