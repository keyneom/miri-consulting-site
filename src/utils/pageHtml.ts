export function extractBodyInnerHtml(html: string): string {
  const bodyOpen = html.indexOf('<body');
  if (bodyOpen === -1) return html;
  const bodyStart = html.indexOf('>', bodyOpen) + 1;
  const bodyEnd = html.lastIndexOf('</body>');
  if (bodyEnd === -1) return html.slice(bodyStart);
  return html.slice(bodyStart, bodyEnd);
}

export function extractHeadInnerHtml(html: string): string {
  const headOpen = html.indexOf('<head');
  if (headOpen === -1) return '';
  const headStart = html.indexOf('>', headOpen) + 1;
  const headEnd = html.indexOf('</head>', headStart);
  if (headEnd === -1) return '';
  return html.slice(headStart, headEnd);
}
