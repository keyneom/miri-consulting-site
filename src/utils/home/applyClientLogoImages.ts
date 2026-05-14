export type ClientLogoImage = {
  src: string;
  alt: string;
  sizeClass?: string;
};

const imagePattern = /<img([^>]*?)src="[^"]*"([^>]*?)>/g;

function expandLogosForMarquee(
  logos: ClientLogoImage[],
  imageCount: number,
): ClientLogoImage[] | null {
  if (imageCount === logos.length) {
    return logos;
  }

  if (imageCount === logos.length * 2) {
    return [...logos, ...logos];
  }

  return null;
}

export function applyClientLogoImages(
  html: string,
  logos: ClientLogoImage[],
): string {
  const marker = 'class="section_logo3';
  const start = html.indexOf(marker);

  if (start === -1 || logos.length === 0) {
    return html;
  }

  const before = html.slice(0, start);
  const section = html.slice(start);
  const imageCount = [...section.matchAll(imagePattern)].length;
  const sources = expandLogosForMarquee(logos, imageCount);

  if (!sources) {
    return html;
  }

  let index = 0;

  const after = section.replace(imagePattern, (match, prefix: string, suffix: string) => {
    const logo = sources[index];
    index += 1;

    if (!logo) {
      return match;
    }

    return `<img${prefix}src="${logo.src}"${suffix}>`;
  });

  return before + after;
}
