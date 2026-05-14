import { formatBulletList } from './formatBulletList';

const expertisePattern =
  /(<h3 class="heading-style-h6">Functional Expertise<\/h3>[\s\S]*?<p class="(?:text-color-grey text-size-small|text-size-small text-color-grey)">)([\s\S]*?)(<\/p>)/g;
const industryPattern =
  /(<h3 class="heading-style-h6">Industry Experience<\/h3>[\s\S]*?<p class="(?:text-size-small text-color-grey|text-color-grey text-size-small)">)([\s\S]*?)(<\/p>)/g;

export type TeamModalExpertise = {
  name: string;
  functionalExpertise: string[];
  industryExperience: string[];
};

function replaceMemberSection(
  html: string,
  member: TeamModalExpertise,
): string {
  const marker = `<h3 class="heading-style-h3">${member.name}</h3>`;
  const start = html.indexOf(marker);

  if (start === -1) {
    return html;
  }

  const nextMarker = html.indexOf('<h3 class="heading-style-h3">', start + marker.length);
  const end = nextMarker === -1 ? html.length : nextMarker;
  const before = html.slice(0, start);
  const section = html.slice(start, end);
  const after = html.slice(end);
  const functional = formatBulletList(member.functionalExpertise);
  const industry = formatBulletList(member.industryExperience);

  const updated = section
    .replace(expertisePattern, (match, prefix: string, current: string, suffix: string) => {
      if (current === functional) {
        return match;
      }

      return `${prefix}${functional}${suffix}`;
    })
    .replace(industryPattern, (match, prefix: string, current: string, suffix: string) => {
      if (current === industry) {
        return match;
      }

      return `${prefix}${industry}${suffix}`;
    });

  return before + updated + after;
}

export function applyTeamModalExpertise(
  html: string,
  members: TeamModalExpertise[],
): string {
  let result = html;

  for (const member of members) {
    result = replaceMemberSection(result, member);
  }

  return result;
}
