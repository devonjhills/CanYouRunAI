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

export const llmModels: LLMModel[] = [
  // -- Corrected and expanded list --
  {
    id: "llama2-7b",
    name: "Llama 2 (7B)",
    description: "Meta's 7B parameter model, good for basic tasks",
    requirements: {
      RAM: "16 GB",
      GPU: "NVIDIA GTX 1070 or better",
      VRAM: "8 GB",
      Storage: "20 GB",
    },
    requiredRAM: "16 GB",
    requiredVRAM: "8 GB",
    recommendedGPU: "NVIDIA GTX 1070 or better",
  },
  {
    id: "llama2-13b",
    name: "Llama 2 (13B)",
    description: "Meta's 13B parameter model, better reasoning capabilities",
    requirements: {
      RAM: "32 GB",
      GPU: "NVIDIA RTX 2070 or better",
      VRAM: "12 GB",
      Storage: "20 GB",
    },
    requiredRAM: "32 GB",
    requiredVRAM: "12 GB",
    recommendedGPU: "NVIDIA RTX 2070 or better",
  },
  {
    id: "llama2-70b",
    name: "Llama 2 (70B)",
    description:
      "Meta's largest Llama 2 model, best performance but resource intensive",
    requirements: {
      RAM: "64 GB",
      GPU: "NVIDIA RTX 3090 or better",
      VRAM: "24 GB",
      Storage: "20 GB",
    },
    requiredRAM: "64 GB",
    requiredVRAM: "24 GB",
    recommendedGPU: "NVIDIA RTX 3090 or better",
  },
  {
    id: "mixtral-8x7b",
    name: "Mixtral 8x7B",
    description:
      "Mistral's mixture of experts model, high performance for diverse tasks",
    requirements: {
      RAM: "48 GB",
      GPU: "NVIDIA RTX 3080 or better",
      VRAM: "24 GB",
      Storage: "20 GB",
    },
    requiredRAM: "48 GB",
    requiredVRAM: "24 GB",
    recommendedGPU: "NVIDIA RTX 3080 or better",
  },
  {
    id: "llama3-8b",
    name: "Llama 3 (8B)",
    description:
      "Meta's efficient 8B parameter model with improved performance",
    requirements: {
      RAM: "32 GB",
      GPU: "NVIDIA RTX 3060 or better",
      VRAM: "16 GB",
      Storage: "20 GB",
    },
    requiredRAM: "32 GB",
    requiredVRAM: "16 GB",
    recommendedGPU: "NVIDIA RTX 3060 or better",
  },
  {
    id: "llama3-70b",
    name: "Llama 3 (70B)",
    description: "Meta's flagship Llama 3 model with enhanced reasoning",
    requirements: {
      RAM: "128 GB",
      GPU: "NVIDIA RTX 4090 or better",
      VRAM: "48 GB",
      Storage: "20 GB",
    },
    requiredRAM: "128 GB",
    requiredVRAM: "48 GB",
    recommendedGPU: "NVIDIA RTX 4090 or better",
  },
  {
    id: "deepseek-r1-70b",
    name: "DeepSeek-R1-Distill-70B",
    description:
      "Top-ranked model, optimized for fast inference and complex tasks",
    requirements: {
      RAM: "128 GB",
      GPU: "NVIDIA RTX 4090 or better",
      VRAM: "24 GB",
      Storage: "20 GB",
    },
    requiredRAM: "128 GB",
    requiredVRAM: "24 GB",
    recommendedGPU: "NVIDIA RTX 4090 or better",
  },
  {
    id: "mixtral-8x22b",
    name: "Mixtral 8x22B",
    description:
      "Next-gen Mistral MoE, excels in reasoning and complex workloads",
    requirements: {
      RAM: "192 GB",
      GPU: "Dual NVIDIA RTX 4090 or better",
      VRAM: "48 GB",
      Storage: "20 GB",
    },
    requiredRAM: "192 GB",
    requiredVRAM: "48 GB",
    recommendedGPU: "Dual NVIDIA RTX 4090 or better",
  },
  {
    id: "phi-3-mini-4k-instruct",
    name: "Phi-3 Mini (4K)",
    description: "Microsoft's small, efficient model for common tasks",
    requirements: {
      RAM: "16 GB",
      GPU: "NVIDIA RTX 2060 or better",
      VRAM: "6 GB",
      Storage: "20 GB",
    },
    requiredRAM: "16 GB",
    requiredVRAM: "6 GB",
    recommendedGPU: "NVIDIA RTX 2060 or better",
  },
  {
    id: "qwen2-72b",
    name: "Qwen2-72B",
    description: "Alibaba's powerful model with a very large context window",
    requirements: {
      RAM: "128 GB",
      GPU: "Dual NVIDIA RTX 4090 or NVIDIA A6000",
      VRAM: "48 GB",
      Storage: "20 GB",
    },
    requiredRAM: "128 GB",
    requiredVRAM: "48 GB",
    recommendedGPU: "Dual NVIDIA RTX 4090 or NVIDIA A6000",
  },
  {
    id: "gemma-7b",
    name: "Gemma 7B",
    description: "Google's open model, strong performance, similar to Llama 2",
    requirements: {
      RAM: "32 GB",
      GPU: "NVIDIA RTX 2080 Ti or better",
      VRAM: "16 GB",
      Storage: "20 GB",
    },
    requiredRAM: "32 GB",
    requiredVRAM: "16 GB",
    recommendedGPU: "NVIDIA RTX 2080 Ti or better",
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    description: "Mistral's most performant model, excels in complex reasoning",
    requirements: {
      RAM: "64 GB",
      GPU: "NVIDIA RTX 4080 or better",
      VRAM: "24 GB",
      Storage: "20 GB",
    },
    requiredRAM: "64 GB",
    requiredVRAM: "24 GB",
    recommendedGPU: "NVIDIA RTX 4080 or better",
  },
  {
    id: "codellama-70b-instruct",
    name: "CodeLlama 70B Instruct",
    description:
      "Specialized coding model, excellent for code generation tasks",
    requirements: {
      RAM: "128 GB",
      GPU: "NVIDIA RTX 4090 or better",
      VRAM: "48 GB",
      Storage: "20 GB",
    },
    requiredRAM: "128 GB",
    requiredVRAM: "48 GB",
    recommendedGPU: "NVIDIA RTX 4090 or better",
  },
  {
    id: "falcon-180b",
    name: "Falcon 180B",
    description:
      "TII's largest Falcon model, for research and high-performance needs",
    requirements: {
      RAM: "512 GB",
      GPU: "8 x NVIDIA RTX A6000 or better",
      VRAM: "48 GB per GPU",
      Storage: "20 GB",
    },
    requiredRAM: "512 GB",
    requiredVRAM: "48 GB per GPU",
    recommendedGPU: "8 x NVIDIA RTX A6000 or better",
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    description:
      "Anthropic's most intelligent model, near-human level comprehension",
    requirements: {
      RAM: "64 GB", // Estimated
      GPU: "NVIDIA RTX 4090 or better", // Estimated for local inference
      VRAM: "24 GB", // Estimated
      Storage: "20 GB",
    },
    requiredRAM: "64 GB", // Estimated
    requiredVRAM: "24 GB", // Estimated
    recommendedGPU: "NVIDIA RTX 4090 or better", // Estimated for local inference
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    description:
      "OpenAI's flagship multimodal model, top-tier general performance",
    requirements: {
      RAM: "64 GB", // Estimated for large context
      GPU: "NVIDIA RTX 4090 or better", // Estimated for local inference
      VRAM: "24 GB", // Estimated
      Storage: "20 GB",
    },
    requiredRAM: "64 GB", // Estimated for large context
    requiredVRAM: "24 GB", // Estimated
    recommendedGPU: "NVIDIA RTX 4090 or better", // Estimated for local inference
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Google's Gemini Pro model with a very long context window",
    requirements: {
      RAM: "64 GB", // Estimated for large context
      GPU: "NVIDIA RTX 4080 or better", // Estimated for local inference
      VRAM: "24 GB", // Estimated
      Storage: "20 GB",
    },
    requiredRAM: "64 GB", // Estimated for large context
    requiredVRAM: "24 GB", // Estimated
    recommendedGPU: "NVIDIA RTX 4080 or better", // Estimated for local inference
  },
  {
    id: "command-r-plus",
    name: "Command R+",
    description:
      "Cohere's top-performing model, excels in enterprise use cases",
    requirements: {
      RAM: "64 GB", // Estimated
      GPU: "NVIDIA RTX 4080 or better", // Estimated for local inference
      VRAM: "24 GB", // Estimated
      Storage: "20 GB",
    },
    requiredRAM: "64 GB", // Estimated
    requiredVRAM: "24 GB", // Estimated
    recommendedGPU: "NVIDIA RTX 4080 or better", // Estimated for local inference
  },
];

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
}
