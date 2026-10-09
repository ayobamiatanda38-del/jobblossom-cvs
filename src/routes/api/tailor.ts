import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({ resume: z.string().trim().min(50).max(20000), job: z.string().trim().min(50).max(15000) });

const SYSTEM = `You are a careful resume editor for JobPrimed. Suggest edits that make the candidate's resume more relevant to the job description.
Strict rules:
- NEVER invent experience, employers, titles, dates, degrees, certifications, metrics or skills that are not in the resume.
- Only rephrase, reorder, emphasize, or surface what the resume already supports. Use the job's wording where it truthfully matches.
- If a job requirement is not supported by the resume, list it under "Gaps to address honestly" and suggest how the candidate could address it truthfully (e.g. only if they genuinely have it). Never write it into the resume.
- Use [add number if true] placeholders instead of making up metrics.
Format in plain Markdown with these sections:
## Fit summary (2-3 sentences)
## Suggested profile summary
## Bullet rewrites (for each: **Original:** ... / **Suggested:** ... / *Why:* ...)
## Skills to highlight (only skills already evidenced)
## Gaps to address honestly
Keep the whole answer under 700 words.`;

export const Route = createFileRoute("/api/tailor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Please paste at least a few lines of both your resume and the job description." }, { status: 400 });
        const { getAiModel } = await import("@/lib/ai/provider.server");
        const ai = getAiModel(request);
        if (!ai) return Response.json({ error: "AI is not configured yet." }, { status: 500 });
        const { streamText } = await import("ai");
        const { withLovableAiGatewayRunIdHeader } = await import("@/lib/ai/run-id.server");
        const runIdFetch = ai.runIdFetch;
        let upstreamError: string | undefined;
        const result = streamText({
          model: ai.model,
          system: SYSTEM,
          messages: [{ role: "user", content: `JOB DESCRIPTION:\n${parsed.data.job}\n\nMY RESUME:\n${parsed.data.resume}` }],
          abortSignal: request.signal,
          maxRetries: 0,
          onError: ({ error }) => { upstreamError = String((error as { message?: string })?.message ?? error); console.error("tailor error", upstreamError); },
          providerOptions: ai.providerOptions,
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
  return "Something went wrong generating suggestions. Please try again.";
}
