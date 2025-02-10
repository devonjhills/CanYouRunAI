import { GPUSpecs } from '@/app/data/gpu-db';

declare const GPU_DATABASE: KVNamespace;

export class GPUStore {
  static async getAll(): Promise<GPUSpecs[]> {
    try {
      const data = await GPU_DATABASE.get<GPUSpecs[]>('gpus', 'json');
      return data || [];
    } catch (error) {
      console.error('Error fetching from KV:', error);
      return [];
    }
  }

  static async search(query: string): Promise<GPUSpecs[]> {
    try {
      const gpus = await this.getAll();
      const lowercaseQuery = query.toLowerCase();
      return gpus.filter(gpu => 
        gpu.model.toLowerCase().includes(lowercaseQuery) ||
        gpu.architecture.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching GPUs:', error);
      return [];
    }
  }

  static async update(gpus: GPUSpecs[]): Promise<boolean> {
    try {
      await GPU_DATABASE.put('gpus', JSON.stringify(gpus));
      return true;
    } catch (error) {
      console.error('Error updating KV:', error);
      return false;
    }
  }

  static async addGPU(gpu: GPUSpecs): Promise<boolean> {
    try {
      const existing = await this.getAll();
      const updated = [...existing, gpu];
      return await this.update(updated);
    } catch (error) {
      console.error('Error adding GPU:', error);
      return false;
    }
  }

  static async removeGPU(model: string): Promise<boolean> {
    try {
      const existing = await this.getAll();
      const updated = existing.filter(gpu => gpu.model !== model);
      return await this.update(updated);
    } catch (error) {
      console.error('Error removing GPU:', error);
      return false;
    }
  }
} 