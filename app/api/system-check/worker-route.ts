interface SystemInfo {
    sessionId: string;
    OS: string;
    CPU: string;
    RAM: string;
    GPU: string;
    VRAM: string;
  }
  
  interface Env {
    SYSTEM_INFO: KVNamespace;
  }
  
  export const runtime = 'edge';
  
  export async function POST(request: Request, env: Env) {
    try {
      const systemInfo: SystemInfo = await request.json();
      
      // Store in Cloudflare KV with 24hr expiration
      await env.SYSTEM_INFO.put(
        systemInfo.sessionId, 
        JSON.stringify(systemInfo), 
        { expirationTtl: 86400 }
      );
      
      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } catch (error) {
      console.error('Error processing system info:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process system info' }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
  }
  
  export async function GET(request: Request, env: Env) {
    try {
      const { searchParams } = new URL(request.url);
      const sessionId = searchParams.get('session');
  
      if (!sessionId) {
        return new Response(
          JSON.stringify({ success: false, error: 'No session ID provided' }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }
  
      const systemInfo = await env.SYSTEM_INFO.get(sessionId, 'json');
      
      if (!systemInfo) {
        return new Response(
          JSON.stringify({ success: false, error: 'Session not found' }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 404 
          }
        );
      }
  
      return new Response(
        JSON.stringify({ success: true, systemInfo }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } catch (error) {
      console.error('Error retrieving system info:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to retrieve system info' }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
  }