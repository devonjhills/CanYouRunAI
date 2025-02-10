export interface CPUSpecs {
  model: string;
  cores: number;
  threads?: number;
  base_clock?: number;
  boost_clock?: number;
  tdp?: number;
}

export const cpuDatabase: CPUSpecs[] = [
  {
    model: "Intel Core i9-13900K",
    cores: 24,
    threads: 32,
    base_clock: 3.0,
    boost_clock: 5.8,
    tdp: 125
  },
  {
    model: "AMD Ryzen 9 7950X",
    cores: 16,
    threads: 32,
    base_clock: 4.5,
    boost_clock: 5.7,
    tdp: 170
  }
  // Add more CPUs as needed
];
