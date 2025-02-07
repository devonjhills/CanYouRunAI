export interface LLMRequirements {
  CPU: string;
  RAM: string;
  GPU: string;
  VRAM: string;
  Storage: string;
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
  // -- From the first listing --
  {
    id: "llama2-7b",
    name: "Llama 2 (7B)",
    description: "Meta's 7B parameter model, good for basic tasks",
    requirements: {
      CPU: "Intel Core i5/AMD Ryzen 5 or better",
      RAM: "16.0 GB",
      GPU: "NVIDIA GTX 1060 6GB or better",
      VRAM: "6.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "16.0 GB",
    requiredVRAM: "6.0 GB",
    recommendedGPU: "NVIDIA GTX 1060 6GB or better",
  },
  {
    id: "llama2-13b",
    name: "Llama 2 (13B)",
    description: "Meta's 13B parameter model, better reasoning capabilities",
    requirements: {
      CPU: "Intel Core i7/AMD Ryzen 7 or better",
      RAM: "32.0 GB",
      GPU: "NVIDIA RTX 2060 8GB or better",
      VRAM: "8.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "32.0 GB",
    requiredVRAM: "8.0 GB",
    recommendedGPU: "NVIDIA RTX 2060 8GB or better",
  },
  {
    id: "llama2-70b",
    name: "Llama 2 (70B)",
    description:
      "Meta's largest model, best performance but resource intensive",
    requirements: {
      CPU: "Intel Core i9/AMD Ryzen 9 or better",
      RAM: "64.0 GB",
      GPU: "NVIDIA RTX 3080 or better",
      VRAM: "16.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "64.0 GB",
    requiredVRAM: "16.0 GB",
    recommendedGPU: "NVIDIA RTX 3080 or better",
  },
  {
    id: "mixtral-8x7b",
    name: "Mixtral 8x7B",
    description:
      "Mistral's mixture of experts model, high performance for diverse tasks",
    requirements: {
      CPU: "Intel Core i9/AMD Ryzen 9 or better",
      RAM: "48.0 GB",
      GPU: "NVIDIA RTX 3070 or better",
      VRAM: "12.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "48.0 GB",
    requiredVRAM: "12.0 GB",
    recommendedGPU: "NVIDIA RTX 3070 or better",
  },
  {
    id: "llama3-1-405b",
    name: "Llama 3.1 (405B)",
    description:
      "Meta's most advanced open-source model, excels in complex tasks with multilingual support and long context capabilities.",
    requirements: {
      CPU: "Intel Xeon/AMD EPYC or better",
      RAM: "128.0 GB",
      GPU: "NVIDIA A100 (80GB) or better",
      VRAM: "80.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "128.0 GB",
    requiredVRAM: "80.0 GB",
    recommendedGPU: "NVIDIA A100 (80GB) or better",
  },
  {
    id: "bloom-176b",
    name: "BLOOM (176B)",
    description:
      "BigScience's multilingual model supporting natural and programming languages, focused on open access.",
    requirements: {
      CPU: "AMD EPYC or Intel Xeon Platinum processors recommended.",
      RAM: "128.0 GB or more",
      GPU: "NVIDIA A100 (80GB) or equivalent cluster setup.",
      VRAM: "80.0 GB per GPU node.",
      Storage: "15.0 GB",
    },
    requiredRAM: "128.0 GB or more",
    requiredVRAM: "80.0 GB per GPU node.",
    recommendedGPU: "NVIDIA A100 (80GB) or equivalent cluster setup.",
  },
  {
    id: "falcon-180b",
    name: "Falcon (180B)",
    description:
      "Technology Innovation Institute's high-performing multilingual model, excelling in reasoning and coding tasks.",
    requirements: {
      CPU: "High-end server-grade CPUs like AMD EPYC.",
      RAM: "256.0 GB recommended.",
      GPU: "NVIDIA H100/A100 GPUs with at least four nodes in a distributed setup.",
      VRAM: ">80.0 GB per node for optimal performance.",
      Storage: "15.0 GB",
    },
    requiredRAM: "256.0 GB recommended.",
    requiredVRAM: ">80.0 GB per node for optimal performance.",
    recommendedGPU:
      "NVIDIA H100/A100 GPUs with at least four nodes in a distributed setup.",
  },

  // -- From the second listing --
  {
    id: "llama3-8b",
    name: "Llama 3.1 (8B)",
    description: "Meta's efficient 8B parameter model with 128k context window",
    requirements: {
      CPU: "Intel Core i7/AMD Ryzen 7 or better",
      RAM: "32.0 GB",
      GPU: "NVIDIA RTX 3060 or better",
      VRAM: "10.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "32.0 GB",
    requiredVRAM: "10.0 GB",
    recommendedGPU: "NVIDIA RTX 3060 or better",
  },
  {
    id: "llama3-70b",
    name: "Llama 3.1 (70B)",
    description: "Meta's flagship model with enhanced reasoning capabilities",
    requirements: {
      CPU: "Intel Core i9/AMD Ryzen 9 or better",
      RAM: "64.0 GB",
      GPU: "NVIDIA RTX 4090 or better",
      VRAM: "24.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "64.0 GB",
    requiredVRAM: "24.0 GB",
    recommendedGPU: "NVIDIA RTX 4090 or better",
  },
  {
    id: "deepseek-r1-70b",
    name: "DeepSeek-R1-Distill-Llama-70B",
    description:
      "Top-ranked model for complex reasoning tasks (12GB VRAM optimized)",
    requirements: {
      CPU: "AMD Ryzen 9/Intel Xeon W-3400",
      RAM: "128.0 GB",
      GPU: "NVIDIA RTX 3090 (24GB) or better",
      VRAM: "12.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "128.0 GB",
    requiredVRAM: "12.0 GB",
    recommendedGPU: "NVIDIA RTX 3090 (24GB) or better",
  },
  {
    id: "mixtral-8x22b",
    name: "Mixtral 8x22B",
    description:
      "State-of-the-art mixture of experts model with 176B total params",
    requirements: {
      CPU: "AMD Threadripper PRO/Intel Xeon W-3400",
      RAM: "96.0 GB",
      GPU: "NVIDIA RTX 4090 (24GB) or dual RTX 3090",
      VRAM: "24.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "96.0 GB",
    requiredVRAM: "24.0 GB",
    recommendedGPU: "NVIDIA RTX 4090 (24GB) or dual RTX 3090",
  },
  {
    id: "phi-4",
    name: "Phi-4",
    description: "Microsoft's lightweight model excelling in math/logic tasks",
    requirements: {
      CPU: "Intel Core i5/AMD Ryzen 5 or better",
      RAM: "24.0 GB",
      GPU: "NVIDIA RTX 3060 or better",
      VRAM: "8.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "24.0 GB",
    requiredVRAM: "8.0 GB",
    recommendedGPU: "NVIDIA RTX 3060 or better",
  },
  {
    id: "qwen2-72b",
    name: "Qwen2.5 72B",
    description: "Alibaba's multilingual model with 131k context window",
    requirements: {
      CPU: "AMD Ryzen 9 7950X3D/Intel Core i9-14900K",
      RAM: "128.0 GB",
      GPU: "NVIDIA RTX 6000 Ada or dual RTX 4090",
      VRAM: "48.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "128.0 GB",
    requiredVRAM: "48.0 GB",
    recommendedGPU: "NVIDIA RTX 6000 Ada or dual RTX 4090",
  },
  {
    id: "gemma2-9b",
    name: "Gemma2 9B",
    description: "Google's lightweight model with strong general performance",
    requirements: {
      CPU: "Intel Core i7/AMD Ryzen 7 or better",
      RAM: "32.0 GB",
      GPU: "NVIDIA RTX 2080 Ti or better",
      VRAM: "10.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "32.0 GB",
    requiredVRAM: "10.0 GB",
    recommendedGPU: "NVIDIA RTX 2080 Ti or better",
  },
  {
    id: "mistral-large2",
    name: "Mistral Large 2",
    description: "Commercial-grade model with 128k context window",
    requirements: {
      CPU: "AMD Ryzen 9/Intel Core i9",
      RAM: "64.0 GB",
      GPU: "NVIDIA RTX 4080 Super or better",
      VRAM: "16.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "64.0 GB",
    requiredVRAM: "16.0 GB",
    recommendedGPU: "NVIDIA RTX 4080 Super or better",
  },
  {
    id: "codestral-mamba",
    name: "Codestral-Mamba",
    description: "Specialized coding model with 256k context window",
    requirements: {
      CPU: "Intel Core i7/AMD Ryzen 7 or better",
      RAM: "48.0 GB",
      GPU: "NVIDIA RTX 3080 (12GB) or better",
      VRAM: "12.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "48.0 GB",
    requiredVRAM: "12.0 GB",
    recommendedGPU: "NVIDIA RTX 3080 (12GB) or better",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    description: "High-speed inference model (10.9 tokens/sec on 24GB VRAM)",
    requirements: {
      CPU: "AMD Ryzen 9 7900X/Intel Core i7-14700K",
      RAM: "64.0 GB",
      GPU: "NVIDIA RTX 4090 or A4000 Ada",
      VRAM: "24.0 GB",
      Storage: "15.0 GB",
    },
    requiredRAM: "64.0 GB",
    requiredVRAM: "24.0 GB",
    recommendedGPU: "NVIDIA RTX 4090 or A4000 Ada",
  },
];

export const modelCategories = [
  { id: "all", label: "All Models" },
  { id: "popular", label: "Popular" },
  { id: "cpu-only", label: "CPU Only" },
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
  ramBandwidth: number;
  gpuBrand: string;
  vramPerGpu: number;
  numGpus: number;
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
