const tabAnchorPattern =
  /<a data-w-tab="Tab \d+" ms-code-onhover="click"[^>]*>[\s\S]*?<\/a>/g;
const menuTitlePattern = /<h3 class="heading-style-h6">([\s\S]*?)<\/h3>/;
const menuDescriptionPattern =
  /<p class="(text-size-small text-color-grey|text-color-grey text-size-small)">([\s\S]*?)<\/p>/;

export type ServiceSubService = {
  modalHeading: string;
  subServices: Array<{ title: string; description: string }>;
};

function escapeHtmlAmpersand(value: string): string {
  return value.replaceAll('&', '&amp;');
}

function findModalSectionBounds(html: string, modalHeading: string): { start: number; end: number } | null {
  const markers = [
    `<h2 class="heading-style-h3">${modalHeading}</h2>`,
    `<h2 class="heading-style-h3">${escapeHtmlAmpersand(modalHeading)}</h2>`,
  ];

  for (const marker of markers) {
    const start = html.indexOf(marker);

    if (start === -1) {
      continue;
    }

    const nextHeading = html.indexOf('<h2 class="heading-style-h3">', start + marker.length);
    const end = nextHeading === -1 ? html.length : nextHeading;

    return { start, end };
  }

  return null;
}

function updateTab(
  tabHtml: string,
  subService: { title: string; description: string },
): string {
  let updated = tabHtml.replace(menuTitlePattern, (match, currentTitle: string) => {
    if (currentTitle === subService.title) {
      return match;
    }

    return `<h3 class="heading-style-h6">${subService.title}</h3>`;
  });

  updated = updated.replace(
    menuDescriptionPattern,
    (match, paragraphClass: string, currentDescription: string) => {
      if (currentDescription === subService.description) {
        return match;
      }

      return `<p class="${paragraphClass}">${subService.description}</p>`;
    },
  );

  return updated;
}

export function applyServiceSubServices(
  html: string,
  services: ServiceSubService[],
): string {
  let result = html;

  for (const service of services) {
    const bounds = findModalSectionBounds(result, service.modalHeading);

    if (!bounds) {
      continue;
    }

    const { start, end } = bounds;
    const before = result.slice(0, start);
    const section = result.slice(start, end);
    const after = result.slice(end);
    const menuStart = section.indexOf('layout493_tabs-menu');
    const menuEnd = section.indexOf('layout493_tabs-content', menuStart);

    if (menuStart === -1 || menuEnd === -1) {
      continue;
    }

    const menu = section.slice(menuStart, menuEnd);
    const tabs = Array.from(menu.matchAll(tabAnchorPattern));

    if (tabs.length !== service.subServices.length) {
      continue;
    }

    let tabIndex = 0;
    const updatedMenu = menu.replace(tabAnchorPattern, (match) => {
      const next = service.subServices[tabIndex];
      tabIndex += 1;

      if (!next) {
        return match;
      }

      return updateTab(match, next);
    });

    result = before + section.slice(0, menuStart) + updatedMenu + section.slice(menuEnd) + after;
  }

  return result;
}
