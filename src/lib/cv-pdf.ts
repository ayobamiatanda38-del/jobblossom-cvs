/** Paginate the actual rendered layout at text boundaries, never stretching it to A4. */
export async function exportCvPdf(node: HTMLElement, file: string, name: string) {
  await document.fonts.ready;
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
  const canvas = await html2canvas(node, { scale: 2, height: node.scrollHeight, backgroundColor: "#ffffff", useCORS: true });
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const box = node.getBoundingClientRect();
  const scale = canvas.width / box.width;
  const pageHeight = canvas.width * 297 / 210;
  const margin = canvas.width * 12 / 210;
  // A modest fit avoids a nearly empty second sheet while keeping type readable.
  if (canvas.height <= (pageHeight - margin) * 1.2) {
    const width = Math.min(210, (297 - 12) * canvas.width / canvas.height);
    pdf.addImage(canvas.toDataURL("image/jpeg", .96), "JPEG", (210 - width) / 2, 0, width, canvas.height * width / canvas.width);
    pdf.setProperties({ title: `${name || "Resume"} — CV`, creator: "JobPrimed" });
    pdf.save(`${file || "CV"}.pdf`);
    return;
  }
  const blocks = Array.from(node.querySelectorAll("h1, h3, p, li, .cv-para > span"))
    .map((el) => { const r = el.getBoundingClientRect(); return { top: (r.top - box.top) * scale, bottom: (r.bottom - box.top) * scale }; });
  let y = 0;
  let page = 0;
  while (y < canvas.height - 1) {
    const available = pageHeight - (page ? margin : 0) - margin;
    const remainingPages = Math.ceil((canvas.height - y) / available);
    const balancedHeight = remainingPages > 1 ? (canvas.height - y) / remainingPages : available;
    let end = Math.min(y + balancedHeight, canvas.height);
    if (end < canvas.height) {
      // Move a crossing line and a stranded section heading to the following page.
      for (let i = 0; i < 30; i++) {
        const crossing = blocks.filter((b) => b.top < end && b.bottom > end && b.top > y + available * .55);
        if (!crossing.length) break;
        end = Math.min(...crossing.map((b) => b.top)) - 4;
      }
      const headings = Array.from(node.querySelectorAll("h3"));
      for (const h of headings) {
        const r = h.getBoundingClientRect();
        const top = (r.top - box.top) * scale;
        if (top < end && top > end - margin * 1.5) end = top - 4;
      }
    }
    if (end <= y) throw new Error("Unable to paginate CV");
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = Math.ceil(end - y);
    const ctx = slice.getContext("2d");
    if (!ctx) throw new Error("PDF canvas unavailable");
    ctx.drawImage(canvas, 0, y, canvas.width, end - y, 0, 0, canvas.width, end - y);
    if (page) pdf.addPage();
    pdf.addImage(slice.toDataURL("image/jpeg", .96), "JPEG", 0, page ? 12 : 0, 210, (end - y) * 210 / canvas.width);
    y = end;
    page++;
  }
  pdf.setProperties({ title: `${name || "Resume"} — CV`, creator: "JobPrimed" });
  pdf.save(`${file || "CV"}.pdf`);
}