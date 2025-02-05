interface Env {
    SYSTEM_INFO: KVNamespace;
}

export default {
    async fetch(request: Request, env: Env) {
        if (!env.SYSTEM_INFO) {
            return new Response(JSON.stringify({ error: 'KV Namespace SYSTEM_INFO is not bound!' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const url = new URL(request.url);

        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
            return handleOptions(request);
        }

        // Serve the .exe file
        if (request.method === 'GET' && url.pathname === '/CanYouRunAI.exe') {
          const exeResponse = await fetch('https://your-origin.com/path/to/your/CanYouRunAI.exe'); // Replace with your actual storage location

          if (!exeResponse.ok) {
              return new Response('Failed to fetch .exe', { status: 500 });
          }
          const exeData = await exeResponse.arrayBuffer();

          return new Response(exeData, {
              status: 200,
              headers: {
                  'Content-Type': 'application/octet-stream',
                  'Content-Disposition': 'attachment; filename="CanYouRunAI.exe"',
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
          return new Response(`
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
          `, {
              headers: { 'Content-Type': 'text/html' },
          });
        }

        // Handle system info submission from the .exe
        if (request.method === 'POST' && url.pathname === '/api/system-check') {
            try {
                const systemInfo = await request.json() as {
                    sessionId: string;
                    OS: string;
                    CPU: string;
                    RAM: string;
                    GPU: string;
                    VRAM: string;
                };

                if (!systemInfo.sessionId) {
                    return new Response(JSON.stringify({ error: 'Missing sessionId' }), { status: 400 });
                }

                console.log(`Writing to KV: ${systemInfo.sessionId}`);
                await env.SYSTEM_INFO.put(systemInfo.sessionId, JSON.stringify({ status: 'completed', ...systemInfo }), { expirationTtl: 86400 });

                // Return success to the .exe
                return new Response(JSON.stringify({ success: true }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*', // Adjust if necessary
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                    status: 200,
                });
            } catch (error) {
                console.error('KV Write Error:', error);
                return new Response(JSON.stringify({ error: 'Failed to process request' }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                    status: 500,
                });
            }
        }

        // Handle system info retrieval (for results page)
        if (request.method === 'GET' && url.pathname === '/api/system-check') {
            const sessionId = url.searchParams.get('session');
            if (!sessionId) {
                return new Response(JSON.stringify({ error: 'Missing sessionId' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            const systemInfo = await env.SYSTEM_INFO.get(sessionId);
            if (!systemInfo) {
                return new Response(JSON.stringify({ error: 'Session not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            const data = JSON.parse(systemInfo);

            // Check if the system info is ready
            if (data.status === 'waiting') {
                // Redirect to the waiting page
                const waitingUrl = new URL('/waiting', request.url);
                waitingUrl.searchParams.set('session', sessionId);
                return Response.redirect(waitingUrl.toString(), 302);
            }

            // Return the system info if it's ready
            return new Response(JSON.stringify({ success: true, systemInfo: data }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                status: 200,
            });
        }

        return new Response('Not Found', { status: 404 });
    },
} satisfies ExportedHandler<Env>;

// Handle CORS OPTIONS request
function handleOptions(request: Request) {
    let headers = request.headers;
    if (
        headers.get('Origin') !== null &&
        headers.get('Access-Control-Request-Method') !== null &&
        headers.get('Access-Control-Request-Headers') !== null
    ) {
        // Handle CORS pre-flight request.
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*', // Adjust if you want to be more restrictive
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400', // Allow for one day
            },
        });
    } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
            headers: {
                Allow: 'GET, POST, OPTIONS',
            },
        });
    }
}