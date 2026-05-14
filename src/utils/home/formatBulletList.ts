export function formatBulletList(items: string[]): string {
  return items.map((item) => `&bull; ${item}`).join('<br/>');
}
