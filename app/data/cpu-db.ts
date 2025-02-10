export interface CPUSpecs {
  model: string;
  cores: number;
  threads: number;
  base_clock: number;
  performance_tier: "entry" | "mid" | "high" | "workstation";
}

export const cpuDatabase: CPUSpecs[] = [
  {
    model: "Intel Core i9-13900K",
    cores: 24,
    threads: 32,
    base_clock: 3.0,
    performance_tier: "high",
  },
  {
    model: "AMD Ryzen 5 5600X",
    cores: 6,
    threads: 12,
    base_clock: 3.7,
    performance_tier: "mid",
  },
]; 