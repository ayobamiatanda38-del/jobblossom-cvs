import { createOpenAI } from "@ai-sdk/openai";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id.server";

/**
 * Picks the AI provider for this server.
 * - On Lovable hosting: LOVABLE_API_KEY (AI Gateway).
 * - Self-hosted (e.g. Vercel): OPENAI_API_KEY, optional OPENAI_MODEL (default gpt-4o-mini).
 * Returns null when neither key is configured.
 */
export function getAiModel(request: Request) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) {
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: lovableKey,
      headers: { "Lovable-API-Key": lovableKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });
    return {
      runIdFetch,
      model: provider.responses("openai/gpt-6-astra"),
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    };
  }
  const openaiKey = process.env["OPENAI_API_KEY"];
  if (openaiKey) {
    const provider = createOpenAI({ apiKey: openaiKey });
    return {
      runIdFetch,
      model: provider.responses(process.env["OPENAI_MODEL"] || "gpt-4o-mini"),
      providerOptions: { openai: { store: false } },
    };
  }
  return null;
}
