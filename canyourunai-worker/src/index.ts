interface SystemInfo {
	Storage: string;
	CPU: string;
	RAM: string;
	GPU: string;
	VRAM: string;
	GPUBandwidth?: number;
	timestamp?: number;
}

interface Env {
	SYSTEM_INFO: KVNamespace;
	GPU_DATABASE: KVNamespace;
}

const ALLOWED_ORIGINS = [
	'http://localhost:3000',
	'https://www.canyourunai.com',
	'https://canyourunai.com'  // Add non-www version
];

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (!env.SYSTEM_INFO) {
			return new Response(JSON.stringify({ error: 'KV Namespace SYSTEM_INFO is not bound!' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const url = new URL(request.url);

		// Add CORS headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Content-Type': 'application/json',
		};

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return handleOptions(request);
		}

		// Handle POST request for system info
		if (request.method === 'POST' && url.pathname === '/api/system-check') {
			try {
				const origin = request.headers.get('Origin') || '';
				const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

				const data = (await request.json()) as SystemInfo;
				data.timestamp = Date.now();
				console.log('Worker received system info:', data);

				// Store in KV for 1 hour
				await env.SYSTEM_INFO.put('latest', JSON.stringify(data), { expirationTtl: 3600 });

				const isLocalhost = origin.includes('localhost');
				const cookieDomain = isLocalhost ? 'localhost' : '.canyourunai.com';

				return new Response(
					JSON.stringify({
						success: true,
						systemInfo: data,
						status: 'completed',
					}),
					{
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
							'Access-Control-Allow-Credentials': 'true',
							'Set-Cookie': `systemInfo=${encodeURIComponent(JSON.stringify(data))}; Domain=${cookieDomain}; Path=/; ${!isLocalhost ? 'SameSite=None; Secure;' : ''} Max-Age=86400`,
						},
					},
				);
			} catch (error) {
				console.error('Error processing system info:', error);
				return new Response(JSON.stringify({ success: false, error: 'Failed to process system info' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		}

		// Handle GET request for system info
		if (request.method === 'GET' && url.pathname === '/api/system-check') {
			const systemInfo = (await env.SYSTEM_INFO.get('latest', 'json')) as SystemInfo | null;
			const isRecent = systemInfo?.timestamp && Date.now() - systemInfo.timestamp < 30000; // 30 seconds

			return new Response(
				JSON.stringify({
					success: true,
					systemInfo: isRecent ? systemInfo : null, // Only return if recent
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': request.headers.get('Origin') || ALLOWED_ORIGINS[0],
						'Access-Control-Allow-Credentials': 'true',
					},
				},
			);
		}

		// Serve the executable file
		if (request.method === 'GET' && (url.pathname === '/CanYouRunAI.exe' || url.pathname === '/CanYouRunAI')) {
			const sessionId = url.searchParams.get('session');
			const isWindows = url.pathname.endsWith('.exe');

			const exeResponse = await fetch(
				isWindows ? 'https://your-origin.com/path/to/your/CanYouRunAI.exe' : 'https://your-origin.com/path/to/your/CanYouRunAI',
			);

			if (!exeResponse.ok) {
				return new Response('Failed to fetch executable', { status: 500 });
			}
			const exeData = await exeResponse.arrayBuffer();

			// Add session ID to filename
			const filename = sessionId ? `${url.pathname}?session=${sessionId}` : url.pathname;

			return new Response(exeData, {
				status: 200,
				headers: {
					'Content-Type': 'application/octet-stream',
					'Content-Disposition': `attachment; filename="${filename}"`,
				},
			});
		}

		// Generate UUID for new sessions (landing page)
		if (request.method === 'GET' && url.pathname === '/') {
			const uuid = crypto.randomUUID();
			const newUrl = new URL(request.url);
			newUrl.pathname = '/waiting';
			newUrl.searchParams.set('session', uuid);

			// Store initial state in KV
			await env.SYSTEM_INFO.put(uuid, JSON.stringify({ status: 'waiting' }), { expirationTtl: 86400 });

			return Response.redirect(newUrl.toString(), 302);
		}

		// Waiting page
		if (request.method === 'GET' && url.pathname === '/waiting') {
			const sessionId = url.searchParams.get('session');
			if (!sessionId) {
				return new Response('Missing session ID', { status: 400 });
			}
			return new Response(
				`
          <!DOCTYPE html>
          <html>
          <head>
              <title>Waiting for Results</title>
              <meta http-equiv="refresh" content="5;url=/api/system-check?session=${sessionId}">
          </head>
          <body>
              <h1>Waiting for results...</h1>
              <p>Please run the downloaded system checker.</p>
              <script>
                  // Periodically check the server for updates
                  setInterval(async () => {
                      const response = await fetch('/api/system-check?session=${sessionId}');
                      if (response.ok) {
                          const data = await response.json();
                          if (data.status === 'completed') {
                              window.location.href = '/?session=${sessionId}'; // Redirect to results page
                          }
                      }
                  }, 5000); // Check every 5 seconds
              </script>
          </body>
          </html>
          `,
				{
					headers: { 'Content-Type': 'text/html' },
				},
			);
		}

		// Handle GPU search
		if (url.pathname.endsWith('/gpus/search')) {
			try {
				const origin = request.headers.get('Origin') || '';
				const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
				
				const corsHeaders = {
					'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Allow-Credentials': 'true',
					'Content-Type': 'application/json'
				};

				const query = url.searchParams.get('q')?.toLowerCase() || '';
				const gpuData = await env.GPU_DATABASE.get('gpu-database', 'json');
				
				if (!gpuData) {
					return new Response(JSON.stringify([]), { 
						headers: corsHeaders 
					});
				}

				// Convert object to array, using Code name as key
				const gpus = Object.entries(gpuData).map(([_, gpu]) => ({
					key: gpu["Code name"],  // Use Code name as the key
					...gpu, // Spread all properties from the original data
					// Ensure these specific fields exist with proper types
					vram: parseInt(String(gpu["Memory Size (MiB)"]).split(' ')[0]) || 0,
					bandwidth: parseFloat(String(gpu["Memory Bandwidth (GB/s)"]).split(' ')[0]) || 0,
					model: gpu.Model || gpu["Code name"], // Use Model field or Code name as fallback
					architecture: gpu["Code name"] || '',
					vendor: gpu.Vendor || ''
				}));

				// Search against Model and Vendor fields
				const filtered = query 
					? gpus.filter(gpu => {
						const modelMatch = (gpu.Model || '').toLowerCase().includes(query);
						const vendorMatch = (gpu.Vendor || '').toLowerCase().includes(query);
						return modelMatch || vendorMatch;
					})
					: [];

				return new Response(JSON.stringify(filtered), {
					headers: corsHeaders
				});
			} catch (error) {
				console.error('Error searching GPU data:', error);
				return new Response(JSON.stringify({ error: 'Failed to search GPU data' }), { 
					status: 500,
					headers: corsHeaders 
				});
			}
		}

		if (request.url.endsWith('/gpus')) {
			try {
				const gpuData = await env.GPU_DATABASE.get('gpu-database');
				if (!gpuData) {
					return new Response('GPU data not found', { status: 404 });
				}
				return new Response(gpuData, {
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				});
			} catch (error) {
				return new Response('Error fetching GPU data', { status: 500 });
			}
		}

		return new Response('Not Found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;

function handleOptions(request: Request) {
	const origin = request.headers.get('Origin') || '';
	const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Allow-Credentials': 'true',
		},
	});
}
