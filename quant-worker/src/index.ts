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

interface ModelSummary {
  description: string | null;
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
  return null;
}

// Define your quantization levels
const QUANTIZATION_LEVELS: QuantizationLevel[] = [
  { name: "q8", bpw: 8 },
  { name: "q4", bpw: 4 },
];

// Entry point: listen for incoming requests
addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request): Promise<Response> {
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

      // Try to fetch the config first to check for access restrictions
      const configResponse = await fetch(
        `https://huggingface.co/${modelId}/resolve/main/config.json`,
      );

      if (configResponse.status === 401 || configResponse.status === 403) {
        const text = await configResponse.text();
        return new Response(
          JSON.stringify({
            error: text || "Access to this model is restricted",
          }),
          {
            status: 403,
            headers: corsHeaders,
          },
        );
      }

      // Continue with the rest of the analysis...
      const [modelConfig, modelParams, modelSummary] = await Promise.all([
        configResponse.ok ? configResponse.json() : null,
        fetchModelParams(modelId),
        fetchModelSummary(modelId),
      ]);

      if (!modelConfig || !isValidConfig(modelConfig)) {
        return new Response(
          JSON.stringify({
            error: "Invalid or incomplete model configuration",
          }),
          { status: 400, headers: corsHeaders },
        );
      }

      if (!modelParams) {
        return new Response(
          JSON.stringify({ error: "Failed to determine model parameters" }),
          { status: 400, headers: corsHeaders },
        );
      }

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

      return new Response(
        JSON.stringify({
          modelConfig,
          modelParams,
          modelSummary,
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

async function fetchModelParams(modelId: string): Promise<number | null> {
  try {
    // try to parse from README
    const readmeResponse = await fetch(
      `https://huggingface.co/${modelId}/raw/main/README.md`,
    );

    if (readmeResponse.ok) {
      const text = await readmeResponse.text();

      // Debug logs
      console.debug("[DEBUG] Model ID:", modelId);
      console.debug("[DEBUG] README Content:", text.substring(0, 500)); // First 500 chars

      // Look for common parameter notations
      const paramPatterns = [
        /Number of Parameters:\s*(\d+\.?\d*)\s*[Bb]/i,
        /(\d+\.?\d*)[\s-]?[Bb](\s|illion|\s?parameters|$)/,
        /(\d+\.?\d*)\s*[Bb]illion\s+parameters/i,
        /parameters:\s*(\d+\.?\d*)\s*[Bb]/i,
        /(\d+\.?\d*)\s*[Bb]illion\s+param/i,
        /(\d+\.?\d*)[Bb]\s+model/i,
      ];

      for (const pattern of paramPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          console.debug(
            "[DEBUG] Found parameter match:",
            match[1],
            "with pattern:",
            pattern,
          );
          const exactParams = parseFloat(match[1]);
          return exactParams * 1e9;
        }
      }

      console.debug("[DEBUG] No parameter match found in patterns");
    }

    // 3. Fall back to config-based estimation
    const config = await fetchModelConfig(modelId);
    if (config) {
      return estimateModelParams(config);
    }

    return null;
  } catch (error) {
    console.error("Error fetching model parameters:", error);
    return null;
  }
}

function estimateModelParams(config: ModelConfig): number {
  const vocabSize = config.vocab_size ?? 0;
  const embeddingParams = vocabSize * config.hidden_size;
  const layerParams = config.num_hidden_layers * 6 * config.hidden_size ** 2;
  return embeddingParams + layerParams;
}

async function fetchModelSummary(modelId: string): Promise<ModelSummary> {
  try {
    const readmeResponse = await fetch(
      `https://huggingface.co/${modelId}/raw/main/README.md`,
    );

    if (!readmeResponse.ok) {
      return { description: null };
    }

    const text = await readmeResponse.text();

    const sections = [
      { name: "Introduction", pattern: /##?\s*(?:\d+\.)?\s*Introduction/i },
      { name: "Description", pattern: /##?\s*(?:\d+\.)?\s*Description/i },
      { name: "Overview", pattern: /##?\s*(?:\d+\.)?\s*Overview/i },
      { name: "About", pattern: /##?\s*(?:\d+\.)?\s*About/i },
      { name: "TL;DR", pattern: /##?\s*(?:\d+\.)?\s*TL;DR/i },
      { name: "Model Summary", pattern: /##?\s*(?:\d+\.)?\s*Model\s+Summary/i },
    ];

    let description = "";
    let source = "";

    // Try to find any section that matches our patterns
    let foundSection = false;
    for (const section of sections) {
      const match = text.match(
        new RegExp(`${section.pattern.source}([^#]+)`, "i"),
      );
      if (match?.[1]) {
        foundSection = true;
        description = match[1].trim();
        source = section.name;
        break;
      }
    }

    // If no sections found, return empty ModelSummary instead of null
    if (!foundSection) {
      return { description: null };
    }

    return {
      description: cleanupMarkdown(description),
    };
  } catch (error) {
    console.error("Error fetching model summary:", error);
    return { description: null };
  }
}

function calculateMaxTokens(
  availableMemoryGb: number,
  config: ModelConfig,
): number {
  const bytesPerElement =
    (config.torch_dtype ?? "float16") === "float32" ? 4 : 2;
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

function isValidConfig(config: any): config is ModelConfig {
  return (
    config &&
    typeof config.hidden_size === "number" &&
    typeof config.max_position_embeddings === "number" &&
    typeof config.num_attention_heads === "number" &&
    typeof config.num_hidden_layers === "number" &&
    typeof config.num_key_value_heads === "number"
  );
}

function analyzeQuantization(
  paramsB: number,
  vramGb: number,
  bandwidth: number,
  ramGb: number,
  bpw: number,
  ramBandwidth: number,
  config: ModelConfig,
): ModelAnalysis {
  const requiredMem = (paramsB * bpw) / 8 / 1e9;
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

function cleanupMarkdown(text: string): string {
  return (
    text
      .trim()
      // First handle lists and paragraphs
      .replace(/^- (.+)$/gm, "<li>$1</li>") // List items
      .replace(/(?:^<li>.*<\/li>\n?)+/gm, '<ul class="space-y-0">$&</ul>') // Wrap lists with no spacing
      .split(/\n{2,}/)
      .map((p) => `<p>${p}</p>`)
      .join("\n") // Paragraphs
      // Then handle inline formatting
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\*([^*]+)\*/g, "<em>$1</em>") // Italic
      .replace(/\n(?!<\/?[pu])/g, "<br />") // Line breaks (not before/after p or ul tags)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>') // Links
      // Clean up any double-wrapping of paragraphs
      .replace(/<p><p>/g, "<p>")
      .replace(/<\/p><\/p>/g, "</p>")
      .replace(/<p>\s*<br \/>\s*<\/p>/g, "") // Remove empty paragraphs
      // If description is too long, truncate it
      .slice(0, 2000)
  );
}
