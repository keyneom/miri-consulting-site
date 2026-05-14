const bodyPattern =
  /<p class="(?:text-size-small text-color-grey|text-color-grey text-size-small)">([\s\S]*?)<\/p>/g;
const labelPattern = /<h3 class="heading-style-h6">([\s\S]*?)<\/h3>/g;
const imagePattern = /<img[^>]*class="layout493_image"[^>]*>/g;

export type IndustryContent = {
  tabLabel: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
};

export function applyIndustryContent(
  html: string,
  industries: IndustryContent[],
): string {
  const marker = 'id="industries"';
  const start = html.indexOf(marker);

  if (start === -1) {
    return html;
  }

  const before = html.slice(0, start);
  const section = html.slice(start);
  const labels = Array.from(section.matchAll(labelPattern));
  const bodies = Array.from(section.matchAll(bodyPattern));
  const images = Array.from(section.matchAll(imagePattern));

  if (
    labels.length !== industries.length ||
    bodies.length !== industries.length ||
    images.length !== industries.length
  ) {
    return html;
  }

  let labelIndex = 0;
  let bodyIndex = 0;
  let imageIndex = 0;

  const after = section
    .replace(labelPattern, (match, currentLabel: string) => {
      const next = industries[labelIndex];
      labelIndex += 1;

      if (!next || next.tabLabel === currentLabel) {
        return match;
      }

      return `<h3 class="heading-style-h6">${next.tabLabel}</h3>`;
    })
    .replace(bodyPattern, (match, currentBody: string) => {
      const next = industries[bodyIndex];
      bodyIndex += 1;

      if (!next || next.body === currentBody) {
        return match;
      }

      const className = match.includes('text-color-grey text-size-small')
        ? 'text-color-grey text-size-small'
        : 'text-size-small text-color-grey';

      return `<p class="${className}">${next.body}</p>`;
    })
    .replace(imagePattern, (match) => {
      const next = industries[imageIndex];
      imageIndex += 1;

      if (!next) {
        return match;
      }

      let updated = match.replace(/src="[^"]*"/, `src="${next.imageSrc}"`);

      if (next.imageAlt) {
        updated = updated.replace(/alt="[^"]*"/, `alt="${next.imageAlt}"`);
      }

      return updated;
    });

  return before + after;
}
