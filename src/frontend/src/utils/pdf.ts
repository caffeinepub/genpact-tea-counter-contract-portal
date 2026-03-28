export function printAsPDF(html: string): void {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(
    `<!DOCTYPE html><html><head><title>Genpact Tender</title><style>body{font-family:Arial,sans-serif;margin:20px;color:#111}h1,h2{color:#0B2A4A}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}@media print{button{display:none}}</style></head><body>${html}</body></html>`,
  );
  win.document.close();
  setTimeout(() => {
    win.print();
  }, 300);
}

export function generateBidReceipt(
  name: string,
  company: string,
  email: string,
  phone: string,
  bidAmount: string,
  submittedAt: string,
  bidId: string,
): void {
  const receiptNo = `GTP-${Date.now().toString(36).toUpperCase()}`;
  const html = `
    <h1>GENPACT TEA COUNTER TENDER</h1>
    <h2>Bid Receipt</h2>
    <hr/>
    <table>
      <tr><td><b>Receipt No</b></td><td>${receiptNo}</td></tr>
      <tr><td><b>Bidder Name</b></td><td>${name}</td></tr>
      <tr><td><b>Company</b></td><td>${company}</td></tr>
      <tr><td><b>Email</b></td><td>${email}</td></tr>
      <tr><td><b>Phone</b></td><td>${phone}</td></tr>
      <tr><td><b>Bid Amount</b></td><td>${bidAmount}</td></tr>
      <tr><td><b>Submitted At</b></td><td>${submittedAt}</td></tr>
      <tr><td><b>Bid ID</b></td><td>${bidId}</td></tr>
    </table>
    <br/><p><small>This is a computer-generated receipt. No signature required.</small></p>
    <button onclick="window.print()">Print / Save as PDF</button>
  `;
  printAsPDF(html);
}

export function generateContractPDF(
  sections: { num: string; title: string; content: string }[],
): void {
  const sectionHTML = sections
    .map(
      (s) =>
        `<h2>${s.num}. ${s.title}</h2><p style="white-space:pre-line">${s.content}</p>`,
    )
    .join("<hr/>");
  const html = `
    <h1>GENPACT TEA COUNTER CONTRACT</h1>
    <p><i>Organized by Third Party Tender Authority (TPTA)</i></p>
    <hr/>
    ${sectionHTML}
    <button onclick="window.print()">Print / Save as PDF</button>
  `;
  printAsPDF(html);
}
