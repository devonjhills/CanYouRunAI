export interface LLMModel {
  id: string;
  name: string;
  category: "popular" | "cpu-only" | "high-end";
  requirements: {
    cpu: string;
    ram: string;
    gpu: string;
    storage: string;
    os: string;
    notes: string;
  };
}

export const llmModels: LLMModel[] = [
  {
    id: "llama2-7b",
    name: "LLaMA 2 (7B)",
    category: "popular",
    requirements: {
      cpu: "Modern multi-core CPU (AMD Ryzen 5/Intel i5 or better)",
      ram: "16GB minimum, 32GB recommended",
      gpu: "NVIDIA GPU with 8GB VRAM (RTX 3060 or better)",
      storage: "20GB free space",
      os: "Windows 10/11, Linux, macOS",
      notes: "Quantized 4-bit version available for lower requirements",
    },
  },
  {
    id: "gpt4all-j",
    name: "GPT4All-J",
    category: "cpu-only",
    requirements: {
      cpu: "x86 64-bit CPU (AMD/Intel)",
      ram: "8GB minimum",
      gpu: "Not required - CPU only",
      storage: "10GB free space",
      os: "Windows 10/11, Linux, macOS",
      notes: "Optimized for CPU inference",
    },
  },
  {
    id: "falcon-7b",
    name: "Falcon (7B)",
    category: "popular",
    requirements: {
      cpu: "AMD Ryzen 7/Intel i7 or better",
      ram: "32GB recommended",
      gpu: "NVIDIA GPU with 12GB VRAM (RTX 3060 Ti or better)",
      storage: "25GB free space",
      os: "Windows 10/11, Linux",
      notes: "Supports 4-bit quantization for reduced requirements",
    },
  },
  {
    id: "mistral-7b",
    name: "Mistral 7B",
    category: "popular",
    requirements: {
      cpu: "Modern 6-core CPU",
      ram: "16GB minimum",
      gpu: "NVIDIA GPU with 8GB VRAM",
      storage: "15GB free space",
      os: "Windows 10/11, Linux, macOS",
      notes: "Excellent performance with 4-bit quantization",
    },
  },
  {
    id: "phi-3",
    name: "Phi-3",
    category: "cpu-only",
    requirements: {
      cpu: "Modern 4-core CPU",
      ram: "8GB minimum",
      gpu: "Optional - Can run on CPU only",
      storage: "5GB free space",
      os: "Windows 10/11, Linux, macOS",
      notes: "Highly efficient, optimized for CPU usage",
    },
  },
];

export const modelCategories = [
  { id: "all", label: "All Models" },
  { id: "popular", label: "Popular" },
  { id: "cpu-only", label: "CPU Only" },
  { id: "high-end", label: "High-End" },
] as const;
