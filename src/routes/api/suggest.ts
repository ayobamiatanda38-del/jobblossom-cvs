import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  jobTitle: z.string().trim().min(2).max(120),
  section: z.string().trim().min(2).max(60),
  current: z.string().max(4000).optional(),
  context: z.string().max(300).optional(),
});

const SYSTEM = `You are JobPrimed's CV writing assistant. Write ready-to-use CV content for ONE section, based on the candidate's job title.
Rules:
- Output only the section content in plain text. No headings, no Markdown, no quotes, no preamble.
- Never invent employers, dates, degrees or exact numbers. Use [X%] or [number] placeholders where a metric belongs.
- If the user has written something already, improve and continue it in the same voice rather than replacing its facts.
Section formats:
- Professional summary: 3-4 sentences, first person implied (no "I").
- Achievements / work experience: 4-5 lines, one per line, each starting with a strong verb, no bullet symbols.
- Skills / Strengths: 8-12 comma-separated items.
- Languages: "Language — Level" separated by " · ".
- Other sections: 3-4 short lines, one per line.
Keep it under 120 words.`;

export const Route = createFileRoute("/api/suggest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Add your job title first so suggestions fit your role." }, { status: 400 });
        const { getAiModel } = await import("@/lib/ai/provider.server");
        const ai = getAiModel(request);
        if (!ai) return Response.json({ error: "AI suggestions are not available on this server yet." }, { status: 500 });
        const { streamText } = await import("ai");
        const { withLovableAiGatewayRunIdHeader } = await import("@/lib/ai/run-id.server");
        const runIdFetch = ai.runIdFetch;
        const d = parsed.data;
        let upstreamError: string | undefined;
        const result = streamText({
          model: ai.model,
          system: SYSTEM,
          messages: [{ role: "user", content: `JOB TITLE: ${d.jobTitle}\nSECTION: ${d.section}${d.context ? `\nCONTEXT: ${d.context}` : ""}\nWHAT I HAVE SO FAR:\n${d.current?.trim() || "(empty)"}` }],
          abortSignal: request.signal,
          maxRetries: 0,
          onError: ({ error }) => { upstreamError = String((error as { message?: string })?.message ?? error); console.error("suggest error", upstreamError); },
          providerOptions: ai.providerOptions,
        });
        const encoder = new TextEncoder();
        const body = new ReadableStream({
          async start(c) {
            try {
              for await (const t of result.textStream) c.enqueue(encoder.encode(t));
              if (upstreamError) c.enqueue(encoder.encode(`[[ERROR]]${friendly(upstreamError)}`));
            } catch (e) {
              c.enqueue(encoder.encode(`[[ERROR]]${friendly(String(e))}`));
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
  if (/429|rate/i.test(m)) return "Too many requests right now. Please wait a minute.";
  if (/403/.test(m)) return "The AI service declined this request.";
  return "Couldn't get a suggestion. Please try again.";
}
