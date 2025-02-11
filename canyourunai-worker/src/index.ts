interface Env {
	SYSTEM_INFO: KVNamespace;
	GPU_DATABASE: KVNamespace;
}

// Define types for GPU data
interface RawGPUData {
	'Code name': string;
	Model: string;
	'Memory Size (MiB)': string;
	'Memory Bandwidth (GB/s)': string;
	Vendor: string;
	[key: string]: string; // Allow for additional properties
}

interface ProcessedGPU {
	key: string;
	Model: string;
	vram: number;
	bandwidth: number;
	model: string;
	architecture: string;
	vendor: string;
	searchText: string;
	'Code name': string;
	'Memory Size (MiB)': string;
	'Memory Bandwidth (GB/s)': string;
	Vendor: string;
	[key: string]: string | number; // Allow for additional properties
}

type GPUDatabase = {
	[key: string]: RawGPUData;
};

const ALLOWED_ORIGINS = ['http://localhost:3000', 'https://www.canyourunai.com', 'https://canyourunai.com'] as const;

const CORS_HEADERS = {
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Allow-Credentials': 'true',
	'Content-Type': 'application/json',
	'Cache-Control': 'public, max-age=3600',
} as const;

function getCorsHeaders(origin: string): Record<string, string> {
	const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin as (typeof ALLOWED_ORIGINS)[number]);
	return {
		...CORS_HEADERS,
		'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
	};
}

function processGPUData(gpu: RawGPUData): ProcessedGPU {
	return {
		key: gpu['Code name'],
		...gpu,
		vram: parseInt(String(gpu['Memory Size (MiB)']).split(' ')[0]) || 0,
		bandwidth: parseFloat(String(gpu['Memory Bandwidth (GB/s)']).split(' ')[0]) || 0,
		model: gpu.Model || gpu['Code name'],
		architecture: gpu['Code name'] || '',
		vendor: gpu.Vendor || '',
		searchText: `${gpu.Model} ${gpu.Vendor}`.toLowerCase(),
	};
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const origin = request.headers.get('Origin') || '';
		const corsHeaders = getCorsHeaders(origin);

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			const cacheUrl = new URL(request.url);
			const cache = caches.default;
			let response = await cache.match(cacheUrl);

			if (!response) {
				if (url.pathname.endsWith('/gpus')) {
					const gpuData = (await env.GPU_DATABASE.get('gpu-database', { type: 'json' })) as GPUDatabase | null;

					if (!gpuData) {
						throw new Error('GPU database not found');
					}

					const processedGPUs: ProcessedGPU[] = Object.values(gpuData).map(processGPUData);

					response = new Response(JSON.stringify(processedGPUs), {
						headers: corsHeaders,
					});

					ctx.waitUntil(cache.put(cacheUrl, response.clone()));
				} else if (url.pathname.endsWith('/gpus/search')) {
					const query = url.searchParams.get('q')?.toLowerCase() || '';

					if (!query) {
						response = new Response(JSON.stringify([]), { headers: corsHeaders });
					} else {
						const baseUrl = new URL(url.origin + '/gpus');
						const cachedGPUs = await cache.match(baseUrl);

						if (cachedGPUs) {
							const gpuList = (await cachedGPUs.json()) as ProcessedGPU[];
							const filtered = gpuList.filter((gpu) => gpu.searchText.includes(query)).slice(0, 50);

							response = new Response(JSON.stringify(filtered), {
								headers: corsHeaders,
							});
						} else {
							const gpuData = (await env.GPU_DATABASE.get('gpu-database', { type: 'json' })) as GPUDatabase | null;

							if (!gpuData) {
								throw new Error('GPU database not found');
							}

							const processedGPUs = Object.values(gpuData)
								.map(processGPUData)
								.filter((gpu) => gpu.searchText.includes(query))
								.slice(0, 50);

							response = new Response(JSON.stringify(processedGPUs), {
								headers: corsHeaders,
							});
						}
					}
				} else {
					return new Response('Not Found', {
						status: 404,
						headers: corsHeaders,
					});
				}
			}

			return response;
		} catch (error) {
			console.error('Error processing request:', error);
			return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
				status: 500,
				headers: corsHeaders,
			});
		}
	},
} satisfies ExportedHandler<Env>;
