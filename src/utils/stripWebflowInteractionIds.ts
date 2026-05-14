export function stripWebflowInteractionIds(html: string): string {
  return html.replace(/\sdata-w-id="[^"]*"/g, '');
}
