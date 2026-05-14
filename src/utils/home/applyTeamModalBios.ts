function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type TeamModalBio = {
  name: string;
  bio: string;
};

function splitBioParagraphs(bio: string): string[] {
  return bio
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function applyTeamModalBios(html: string, members: TeamModalBio[]): string {
  let result = html;

  for (const member of members) {
    const paragraphs = splitBioParagraphs(member.bio);

    if (paragraphs.length >= 2) {
      const continuedPattern = new RegExp(
        `(<h3 class="heading-style-h3">${escapeRegExp(member.name)}</h3></div><p class="text-size-medium-smallspace text-color-grey">)([\\s\\S]*?)(</p><p class="text-size-medium-smallspace text-color-grey">)([\\s\\S]*?)(</p>)`,
      );

      result = result.replace(
        continuedPattern,
        (match, prefix: string, currentBio: string, middle: string, currentContinued: string, suffix: string) => {
          if (currentBio === paragraphs[0] && currentContinued === paragraphs[1]) {
            return match;
          }

          return `${prefix}${paragraphs[0]}${middle}${paragraphs[1]}${suffix}`;
        },
      );
      continue;
    }

    const pattern = new RegExp(
      `(<h3 class="heading-style-h3">${escapeRegExp(member.name)}</h3></div><p class="text-size-medium-smallspace text-color-grey">)([\\s\\S]*?)(</p>)`,
    );

    result = result.replace(pattern, (match, prefix: string, currentBio: string, suffix: string) => {
      const nextBio = paragraphs[0] ?? member.bio;

      if (currentBio === nextBio) {
        return match;
      }

      return `${prefix}${nextBio}${suffix}`;
    });
  }

  return result;
}
