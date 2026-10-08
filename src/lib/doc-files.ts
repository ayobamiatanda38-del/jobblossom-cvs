// Browser-only helpers: read uploaded resumes and export text documents as PDF.

export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist");
    const worker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = worker;
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const c = await (await doc.getPage(i)).getTextContent();
      let line = "";
      const out: string[] = [];
      for (const it of c.items as Array<{ str?: string; hasEOL?: boolean }>) {
        line += it.str ?? "";
        if (it.hasEOL) { out.push(line); line = ""; }
      }
      if (line) out.push(line);
      pages.push(out.join("\n"));
    }
    return pages.join("\n\n").trim();
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return r.value.trim();
  }
  if (name.endsWith(".txt") || file.type.startsWith("text/")) return (await file.text()).trim();
  throw new Error("Please upload a PDF, Word (.docx) or text file.");
}

/** Renders light Markdown text (headings, bullets, bold) into a clean A4 PDF and downloads it. */
export async function downloadTextPdf(title: string, markdown: string, filename: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight(), M = 56;
  let y = M;
  const ensure = (h: number) => { if (y + h > H - M) { pdf.addPage(); y = M; } };
  if (title) { pdf.setFont("helvetica", "bold"); pdf.setFontSize(18); pdf.text(title, M, y + 4); y += 30; }
  for (const raw of markdown.replace(/\r/g, "").split("\n")) {
    let line = raw.trimEnd();
    let size = 11, bold = false, indent = 0;
    if (/^#{1,6}\s/.test(line)) { size = /^##?\s/.test(line) ? 14 : 12; bold = true; line = line.replace(/^#+\s/, ""); y += 6; }
    else if (/^\s*[-*]\s/.test(line)) { indent = 14; line = "•  " + line.replace(/^\s*[-*]\s/, ""); }
    else if (/^-{3,}$/.test(line.trim())) { ensure(16); pdf.setDrawColor(200); pdf.line(M, y, W - M, y); y += 14; continue; }
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) bold = true;
    line = line.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
    if (!line.trim()) { y += 8; continue; }
    pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(size);
    const lh = size * 1.45;
    for (const part of pdf.splitTextToSize(line, W - M * 2 - indent) as string[]) {
      ensure(lh); pdf.text(part, M + indent, y + size); y += lh;
    }
  }
  pdf.save(filename);
}
