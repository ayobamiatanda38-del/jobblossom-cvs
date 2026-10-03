import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({ resume: z.string().trim().min(50).max(20000), job: z.string().trim().min(50).max(15000), tone: z.enum(["professional", "warm", "confident"]).optional() });

const SYSTEM = `You are a careful cover letter writer for JobPrimed. Draft a tailored cover letter for the candidate based on their resume and the job description.
Strict rules:
- NEVER invent experience, employers, titles, dates, degrees, certifications, metrics or skills that are not in the resume.
- Only rephrase, emphasise and connect what the resume already supports. Use the job's wording where it truthfully matches.
- If the job asks for something the resume does not support, do not claim it. You may express genuine interest in learning it instead.
- Use [Company], [Hiring Manager] and [add number if true] placeholders where details are unknown. Never make up names or metrics.
- Sound like a real person, not a template: specific, warm and concise. No clichés like "I am writing to express my interest".
Format in plain Markdown:
- A one-line suggested subject line, then the letter itself (greeting, 3-4 short paragraphs, sign-off with [Your Name]).
- After the letter, a short "---" divider and a "Why this works" list of 3 bullets explaining the choices.
Keep the whole answer under 600 words.`;

export const Route = createFileRoute("/api/cover-letter")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Please paste at least a few lines of both your resume and the job description." }, { status: 400 });
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "AI is not configured yet." }, { status: 500 });
        const { createOpenAI } = await import("@ai-sdk/openai");
        const { streamText } = await import("ai");
        const { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } = await import("@/lib/ai/run-id.server");
        const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });
        const tone = parsed.data.tone ?? "professional";
        let upstreamError: string | undefined;
        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          system: SYSTEM,
          messages: [{ role: "user", content: `TONE: ${tone}\n\nJOB DESCRIPTION:\n${parsed.data.job}\n\nMY RESUME:\n${parsed.data.resume}` }],
          abortSignal: request.signal,
          maxRetries: 0,
          onError: ({ error }) => { upstreamError = String((error as { message?: string })?.message ?? error); console.error("cover-letter error", upstreamError); },
          providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
        });
        const encoder = new TextEncoder();
        const body = new ReadableStream({
          async start(c) {
            try {
              for await (const t of result.textStream) c.enqueue(encoder.encode(t));
              if (upstreamError) c.enqueue(encoder.encode(`\n\n[[ERROR]]${friendly(upstreamError)}`));
            } catch (e) {
              c.enqueue(encoder.encode(`\n\n[[ERROR]]${friendly(String(e))}`));
            }
            c.close();
          },
        });
        return withLovableAiGatewayRunIdHeader(new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-cache, no-transform" } }), runIdFetch);
      },
    },
  },
});

function friendly(m: string) {
  if (/402|credit/i.test(m)) return "AI credits have run out for now. Please try again later.";
  if (/429|rate/i.test(m)) return "Too many requests right now. Please wait a minute and try again.";
  if (/403/.test(m)) return "The AI service declined this request.";
  return "Something went wrong drafting your letter. Please try again.";
}
