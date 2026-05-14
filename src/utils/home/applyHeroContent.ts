export type HeroContent = {
  headline: string;
  subheadline: string;
};

export function applyHeroContent(html: string, hero: HeroContent): string {
  let result = html;

  result = result.replace(
    /<h1 class="heading-style-h1 hero">([\s\S]*?)<\/h1>/,
    (match, currentHeadline: string) => {
      if (currentHeadline === hero.headline) {
        return match;
      }

      return `<h1 class="heading-style-h1 hero">${hero.headline}</h1>`;
    },
  );

  result = result.replace(
    /<p class="text-size-medium hero">([\s\S]*?)<\/p>/,
    (match, currentSubheadline: string) => {
      if (currentSubheadline === hero.subheadline) {
        return match;
      }

      return `<p class="text-size-medium hero">${hero.subheadline}</p>`;
    },
  );

  return result;
}
