import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id.server";

/**
 * Picks the AI provider for this server.
 * - On Lovable hosting: LOVABLE_API_KEY (AI Gateway).
 * - Self-hosted (e.g. Vercel), preferred: ANTHROPIC_API_KEY, optional ANTHROPIC_MODEL (default claude-sonnet-5).
 * - Self-hosted fallback: OPENAI_API_KEY, optional OPENAI_MODEL (default gpt-4o-mini).
 * Returns null when none of these are configured.
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
  const anthropicKey = process.env["ANTHROPIC_API_KEY"];
  if (anthropicKey) {
    const provider = createAnthropic({ apiKey: anthropicKey, fetch: runIdFetch.fetch });
    return {
      runIdFetch,
      model: provider(process.env["ANTHROPIC_MODEL"] || "claude-sonnet-5"),
      providerOptions: {},
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
