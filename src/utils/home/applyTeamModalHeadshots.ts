import { escapeRegExp } from './escapeRegExp';

export type TeamModalHeadshot = {
  name: string;
  src: string;
  alt: string;
};

export function applyTeamModalHeadshots(
  html: string,
  members: TeamModalHeadshot[],
): string {
  let result = html;

  for (const member of members) {
    const pattern = new RegExp(
      `(<div class="layout507_image-wrapper"><img[^>]*src=")([^"]+)("[^>]*>[\\s\\S]*?<h3 class="heading-style-h3">${escapeRegExp(member.name)}</h3>)`,
    );

    result = result.replace(pattern, (match, prefix: string, currentSrc: string, suffix: string) => {
      if (currentSrc === member.src) {
        return match;
      }

      const withAlt = suffix.replace(/alt="[^"]*"/, `alt="${member.alt}"`);

      return `${prefix}${member.src}${withAlt}`;
    });
  }

  return result;
}
