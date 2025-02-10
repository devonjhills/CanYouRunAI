interface KVNamespace {
  get<T = unknown>(key: string, type: 'json'): Promise<T | null>;
  get(key: string, type: 'text'): Promise<string | null>;
  get(key: string): Promise<ArrayBuffer | null>;
  put(key: string, value: string | ArrayBuffer | ReadableStream): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }>;
}

declare global {
  const GPU_DATABASE: KVNamespace;
}

export {}; 