const modalBlockPattern =
  /<div[^>]*class="layout507_card-content-top"[^>]*><div class="margin-bottom margin-small"><h2 class="heading-style-h3">([\s\S]*?)<\/h2><\/div><p class="text-size-medium-smallspace text-color-grey">([\s\S]*?)<\/p><\/div>/g;

export function applyServiceModals(
  html: string,
  modals: Array<{ heading: string; subheading: string }>,
): string {
  const marker = 'id="services"';
  const start = html.indexOf(marker);

  if (start === -1) {
    return html;
  }

  const before = html.slice(0, start);
  const section = html.slice(start);
  const matches = Array.from(section.matchAll(modalBlockPattern));

  if (matches.length === 0 || matches.length !== modals.length) {
    return html;
  }

  let index = 0;

  const after = section.replace(modalBlockPattern, (match, currentHeading: string, currentSubheading: string) => {
    const next = modals[index];
    index += 1;

    if (!next || (next.heading === currentHeading && next.subheading === currentSubheading)) {
      return match;
    }

    const opening = match.slice(0, match.indexOf('<h2 class="heading-style-h3">'));

    return `${opening}<h2 class="heading-style-h3">${next.heading}</h2></div><p class="text-size-medium-smallspace text-color-grey">${next.subheading}</p></div>`;
  });

  return before + after;
}
