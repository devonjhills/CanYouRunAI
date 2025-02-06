export interface LLMRequirements {
  CPU: string;
  RAM: string;
  GPU: string;
  VRAM: string;
  OS: string;
}

export interface LLMModel {
  id: string;
  name: string;
  description: string;
  requirements: LLMRequirements;
}

export const llmModels: LLMModel[] = [
  {
    id: "llama2-7b",
    name: "Llama 2 (7B)",
    description: "Meta's 7B parameter model, good for basic tasks",
    requirements: {
      CPU: "Intel Core i5/AMD Ryzen 5 or better",
      RAM: "16.0 GB",
      GPU: "NVIDIA GTX 1060 6GB or better",
      VRAM: "6.0 GB",
      OS: "windows", // Matches runtime.GOOS format
    },
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
      OS: "windows",
    },
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
      OS: "windows",
    },
  },
  {
    id: "mixtral-8x7b",
    name: "Mixtral 8x7B",
    description: "Mistral's mixture of experts model, high performance",
    requirements: {
      CPU: "Intel Core i9/AMD Ryzen 9 or better",
      RAM: "48.0 GB",
      GPU: "NVIDIA RTX 3070 or better",
      VRAM: "12.0 GB",
      OS: "windows",
    },
  },
];

export const modelCategories = [
  { id: "all", label: "All Models" },
  { id: "popular", label: "Popular" },
  { id: "cpu-only", label: "CPU Only" },
  { id: "high-end", label: "High-End" },
] as const;
