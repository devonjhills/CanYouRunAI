// Define interfaces for types used in the Worker
interface ModelConfig {
  _name_or_path: string;
  architectures?: string[];
  attention_dropout?: number;
  bos_token_id?: number;
  embd_pdrop?: number;
  eos_token_id?: number;
  hidden_act?: string;
  hidden_size: number;
  initializer_range?: number;
  intermediate_size?: number;
  layer_norm_eps?: number;
  max_position_embeddings: number;
  model_type?: string;
  num_attention_heads: number;
  num_hidden_layers: number;
  num_key_value_heads: number;
  partial_rotary_factor?: number;
  qk_layernorm?: boolean;
  resid_pdrop?: number;
  rope_scaling?: any;
  rope_theta?: number;
  tie_word_embeddings?: boolean;
  torch_dtype: string;
  transformers_version?: string;
  use_cache?: boolean;
  vocab_size?: number;
}

interface SystemSpecs {
  vramPerGpu: number;
  numGpus: number;
  gpuBandwidth: number;
  totalRam: number;
  ramBandwidth: number;
  gpuBrand?: string;
}

interface ModelAnalysis {
  runType: string;
  memoryRequired: number;
  offloadPercentage: number;
  tokensPerSecond: number | null;
  maxContext: number | null;
}

interface QuantizationLevel {
  name: string;
  bpw: number;
}

interface RequestBody {
  modelId: string;
  systemSpecs: SystemSpecs;
}

// Allowed origins and helper functions for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://www.canyourunai.com",
];

function getOrigin(request: Request): string {
  return request.headers.get("Origin") ?? ALLOWED_ORIGINS[0]!;
}

function handleCors(request: Request): Response | null {
  const origin = getOrigin(request);
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
  // For preflight OPTIONS requests, always return the proper CORS headers.
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": isAllowedOrigin
          ? origin
          : ALLOWED_ORIGINS[0]!,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  // For non-OPTIONS requests, do not reject outright; let the request proceed.
  return null;
}

// Define your quantization levels (replace with additional levels if needed)
const QUANTIZATION_LEVELS: QuantizationLevel[] = [
  { name: "q8", bpw: 8 },
  { name: "q4", bpw: 4 },
  // Add other levels as needed
];

// Entry point: listen for incoming requests
addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request): Promise<Response> {
  // Check CORS first
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const origin = getOrigin(request);
  const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
      ? origin
      : ALLOWED_ORIGINS[0]!,
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
  } as const;

  const url = new URL(request.url);
  if (request.method === "POST" && url.pathname === "/api/quantize") {
    try {
      const body: RequestBody = await request.json();
      const { modelId, systemSpecs } = body;

      if (!modelId || !systemSpecs) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      console.log("Received request for model:", modelId);

      // Fetch model configuration from Hugging Face
      const modelConfig = await fetchModelConfig(modelId);
      if (!modelConfig) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch model config" }),
          { status: 400, headers: corsHeaders },
        );
      }

      // Estimate the model's parameter count using the config.
      // Here we assume that if vocab_size is provided, it will be used.
      const modelParams = estimateModelParams(modelConfig);
      console.log("Estimated model parameters:", modelParams);

      // Compute quantization results for each level
      const quantizationResults: Record<string, ModelAnalysis> = {};
      for (const { name, bpw } of QUANTIZATION_LEVELS) {
        quantizationResults[name] = analyzeQuantization(
          modelParams,
          systemSpecs.vramPerGpu * systemSpecs.numGpus,
          systemSpecs.gpuBandwidth,
          systemSpecs.totalRam,
          bpw,
          systemSpecs.ramBandwidth,
          modelConfig,
        );
      }

      // Return the results as JSON, including CORS headers.
      return new Response(
        JSON.stringify({
          modelConfig,
          modelParams,
          systemSpecs,
          quantizationResults,
        }),
        { headers: corsHeaders },
      );
    } catch (error: unknown) {
      console.error("Error processing quantization:", error);
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
}

// --- Helper functions ---

// Fetch model configuration from Hugging Face
async function fetchModelConfig(modelId: string): Promise<ModelConfig | null> {
  try {
    const response = await fetch(
      `https://huggingface.co/${modelId}/resolve/main/config.json`,
    );
    if (!response.ok) throw new Error("Failed to fetch config");
    return await response.json();
  } catch (e) {
    console.error("Error fetching model config:", e);
    return null;
  }
}

// Estimate total model parameters based on configuration.
// This is a rough approximation that adds embedding parameters and per-layer parameters.
function estimateModelParams(config: ModelConfig): number {
  const vocabSize = config.vocab_size ?? 0;
  const embeddingParams = vocabSize * config.hidden_size;
  // Rough estimate: each transformer layer roughly contributes ~6 * (hidden_size^2) parameters.
  const layerParams = config.num_hidden_layers * 6 * config.hidden_size ** 2;
  return embeddingParams + layerParams;
}

// Calculate maximum tokens based on available memory and model config
function calculateMaxTokens(
  availableMemoryGb: number,
  config: ModelConfig,
): number {
  const bytesPerElement = config.torch_dtype === "float32" ? 4 : 2;
  const memoryPerToken =
    config.num_hidden_layers *
    config.num_key_value_heads *
    (config.hidden_size / config.num_attention_heads) *
    2 *
    bytesPerElement;
  const availableMemoryBytes = availableMemoryGb * 1024 ** 3;
  const maxTokens = Math.floor(availableMemoryBytes / memoryPerToken);
  return Math.min(maxTokens, config.max_position_embeddings);
}

// Analyze quantization parameters and estimate performance
function analyzeQuantization(
  paramsB: number,
  vramGb: number,
  bandwidth: number,
  ramGb: number,
  bpw: number,
  ramBandwidth: number,
  config: ModelConfig,
): ModelAnalysis {
  const requiredMem = (paramsB * bpw) / 8 / 1e9; // Memory in GB
  let ctx = 0;

  if (requiredMem <= vramGb) {
    ctx = calculateMaxTokens(vramGb - requiredMem, config);
    const tks = bandwidth / requiredMem;
    return {
      runType: "All in VRAM",
      memoryRequired: requiredMem,
      offloadPercentage: 0,
      tokensPerSecond: tks,
      maxContext: ctx,
    };
  }

  if (requiredMem <= vramGb + 1 && vramGb > 1) {
    ctx = calculateMaxTokens(ramGb + vramGb - requiredMem, config);
    const tks = (bandwidth / requiredMem) * 0.9;
    return {
      runType: "KV cache offload",
      memoryRequired: requiredMem,
      offloadPercentage: 0,
      tokensPerSecond: tks,
      maxContext: ctx,
    };
  }

  if (vramGb > 1 && requiredMem <= ramGb + vramGb) {
    ctx = calculateMaxTokens(ramGb + vramGb - requiredMem, config);
    const offloadRatio = ((requiredMem - vramGb) / requiredMem) * 100;
    const baseTks = (ramBandwidth / requiredMem) * 0.9;
    const tks =
      baseTks * (0.052 * Math.exp((4.55 * (100 - offloadRatio)) / 100) + 1.06);
    return {
      runType: "Partial offload",
      memoryRequired: requiredMem,
      offloadPercentage: offloadRatio,
      tokensPerSecond: tks,
      maxContext: ctx,
    };
  }

  if (requiredMem <= ramGb) {
    ctx = calculateMaxTokens(ramGb - requiredMem, config);
    const tks = (ramBandwidth / requiredMem) * 0.9;
    return {
      runType: "All in System RAM",
      memoryRequired: requiredMem,
      offloadPercentage: 100,
      tokensPerSecond: tks,
      maxContext: ctx,
    };
  }

  return {
    runType: "Won't run",
    memoryRequired: requiredMem,
    offloadPercentage: 0,
    tokensPerSecond: null,
    maxContext: null,
  };
}
