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

const ALLOWED_ORIGINS = {
	development: ['http://localhost:3000'] as string[],
	production: ['https://www.canyourunai.com', 'https://canyourunai.com'] as string[],
};

const CORS_HEADERS = {
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Allow-Credentials': 'true',
	'Content-Type': 'application/json',
	'Cache-Control': 'public, max-age=3600',
} as const;

function getCorsHeaders(requestUrl: string, origin: string): Record<string, string> {
	// Check the origin header for development indicators
	const isDevelopment = origin.includes('localhost') || origin.includes('127.0.0.1');
	const allowedOrigins = isDevelopment ? ALLOWED_ORIGINS.development : ALLOWED_ORIGINS.production;

	// Add debug headers in development
	const headers = {
		...CORS_HEADERS,
		'Debug-Is-Development': isDevelopment.toString(),
		'Debug-Origin': origin,
		'Debug-Allowed-Origins': JSON.stringify(allowedOrigins),
	};

	// If origin is allowed, return it in the header
	if (allowedOrigins.includes(origin)) {
		return {
			...headers,
			'Access-Control-Allow-Origin': origin,
		};
	}

	// Default to blocking unknown origins
	return {
		...headers,
		'Access-Control-Allow-Origin': ALLOWED_ORIGINS.production[0],
	};
}

function processGPUData(gpu: RawGPUData): ProcessedGPU {
	// Get memory size from either MiB or GiB field
	const memorySizeMiB = gpu['Memory Size (MiB)'];
	const memorySizeGiB = gpu['Memory Size (GiB)'];
	const memorySize = String(memorySizeMiB || memorySizeGiB || '0');
	let vram = 0;

	if (String(memorySize).includes('GiB') || memorySizeGiB) {
		// If in GiB, convert to number directly
		vram = parseFloat(String(memorySize).split(' ')[0]);
	} else if (String(memorySize).includes('MiB') || memorySizeMiB) {
		// If in MiB, convert to GiB
		vram = parseFloat(String(memorySize).split(' ')[0]) / 1024;
	} else {
		// Handle cases where it's just a number or has other units
		const value = parseFloat(String(memorySize).split(' ')[0]);
		// Assume MiB if value is large (>100), otherwise assume GiB
		vram = value > 100 ? value / 1024 : value;
	}
	return {
		key: gpu['Code name'],
		...gpu,
		vram: vram,
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
		const origin = request.headers.get('Origin') || ALLOWED_ORIGINS.production[0];

		// Handle preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': origin,
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Allow-Credentials': 'true',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		const corsHeaders = getCorsHeaders(request.url, origin);

		try {
			let response: Response | undefined;
			const cache = (caches as unknown as { default: Cache }).default;

			if (url.pathname.endsWith('/gpus')) {
				const cacheUrl = new URL(request.url);
				cacheUrl.searchParams.set('origin', origin);
				response = await cache.match(cacheUrl);

				if (!response) {
					const gpuData = (await env.GPU_DATABASE.get('gpu-database', { type: 'json' })) as GPUDatabase | null;

					if (!gpuData) {
						console.error('GPU database is null or undefined');
						throw new Error('GPU database not found');
					}

					console.log('GPU data sample:', Object.values(gpuData)[0]); // Log first GPU
					const processedGPUs = Object.values(gpuData).map(processGPUData);
					console.log('Processed GPU sample:', processedGPUs[0]); // Log first processed GPU

					response = new Response(JSON.stringify(processedGPUs), {
						headers: corsHeaders,
					});

					ctx.waitUntil(cache.put(cacheUrl, response.clone()));
				}
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

			return (
				response ||
				new Response('Not Found', {
					status: 404,
					headers: corsHeaders,
				})
			);
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const errorStack = error instanceof Error ? error.stack : undefined;

			console.error('Detailed error:', {
				message: errorMessage,
				stack: errorStack,
				error,
			});
			return new Response(
				JSON.stringify({
					error: 'Internal Server Error',
					details: errorMessage,
				}),
				{
					status: 500,
					headers: corsHeaders,
				},
			);
		}
	},
} satisfies ExportedHandler<Env>;
