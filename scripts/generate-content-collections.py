#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
import shutil
import unicodedata
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "baseline" / "home.html"
PUBLIC = ROOT / "public" / "cdn.prod.website-files.com" / "64f363b4ba0fc1362362824f"
LOCAL_LOGOS = ROOT / "public" / "local-brand-logos"
CONTENT = ROOT / "src" / "content"
ASSETS = ROOT / "src" / "assets"
CREATED: list[str] = []


def strip_tags(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", value)).strip()


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()


def copy_asset(url: str, dest_dir: Path, dest_name: str | None = None) -> str:
    if not url:
        raise ValueError("Missing asset URL")
    if url.startswith("local-brand-logos/"):
        src = ROOT / "public" / url
    elif url.startswith("/"):
        src = ROOT / "public" / url.lstrip("/")
    else:
        src_name = unquote(url.split("/")[-1])
        src = PUBLIC / src_name
        if not src.exists():
            stem = src_name.split("-p-")[0].split(".")[0]
            matches = [path for path in PUBLIC.glob(f"*{stem}*") if path.is_file()]
            if matches:
                src = max(matches, key=lambda path: path.stat().st_size)
            else:
                raise FileNotFoundError(url)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / (dest_name or src.name)
    if not dest.exists():
        shutil.copy2(src, dest)
        CREATED.append(str(dest.relative_to(ROOT)))
    return f"../../assets/{dest_dir.name}/{dest.name}"


def write_md(path: Path, frontmatter: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = ["---"]
    for key, value in frontmatter.items():
        if value is None:
            continue
        if isinstance(value, list):
            lines.append(f"{key}:")
            for item in value:
                if isinstance(item, dict):
                    lines.append(f"  - title: {json.dumps(item['title'])}")
                    lines.append(f"    description: {json.dumps(item['description'])}")
                else:
                    lines.append(f"  - {json.dumps(item)}")
        elif isinstance(value, bool):
            lines.append(f"{key}: {'true' if value else 'false'}")
        elif isinstance(value, (int, float)):
            lines.append(f"{key}: {value}")
        else:
            lines.append(f"{key}: {json.dumps(value)}")
    lines.append("---\n")
    path.write_text("\n".join(lines), encoding="utf-8")
    CREATED.append(str(path.relative_to(ROOT)))


def bullets_from_paragraph(paragraph_html: str) -> list[str]:
    parts = re.split(r"<br\s*/?>", paragraph_html)
    return [strip_tags(part).lstrip("•").strip() for part in parts if strip_tags(part).lstrip("•").strip()]


def extract_team(text: str) -> list[dict]:
    meta = {
        "Ramel Sanchez": ("ramel-sanchez", 1, "Management & Operational Development", "modal-5", "functional"),
        "Nauman Nadeem": ("nauman-nadeem", 2, "Accounting & FP&A Services", "modal-6", "functional"),
        "Kelvin Man": ("kelvin-man", 3, "Digital Design", "modal-7", "functional"),
        "Mika Sanchez": ("mika-sanchez", 4, "Development & CTO Services", "modal-8", "functional"),
        "Keenan Baird": ("keenan-baird", 5, "Management & Operational Development", "modal-12", "industry"),
        "Amber Shoap": ("amber-shoap", 6, "Management & Operational Development", "modal-10", "functional"),
        "Rachel Garner": ("rachel-garner", 7, "Digital Design", "modal-9", "functional"),
        "Arianne Rabbitt": ("arianne-rabbitt", 8, "Strategic HR Leadership & Development", "modal-11", "functional"),
    }
    people: list[dict] = []
    for block in text.split("fs_modal-1_wrapper-2 people")[1:]:
        name_match = re.search(r'<h3 class="heading-style-h3">([^<]+)</h3>', block)
        if not name_match:
            continue
        name = strip_tags(name_match.group(1))
        if name not in meta:
            continue
        slug, order, role_label, modal_id, default_tab = meta[name]
        bio_match = re.search(
            r'<p class="text-size-medium-smallspace text-color-grey">(.*?)</p>', block, re.DOTALL
        )
        image_match = re.search(r'class="layout507_image"[^>]*src="([^"]+)"', block) or re.search(
            r'src="([^"]+)"[^>]*class="layout507_image"', block
        )
        functional: list[str] = []
        industry: list[str] = []
        for tab, body in re.findall(
            r'<a data-w-tab="Tab (\d)".*?<p class="[^"]*">(.*?)</p>', block, re.DOTALL
        ):
            items = bullets_from_paragraph(body)
            if tab == "1":
                functional = items
            else:
                industry = items
        people.append(
            {
                "name": name,
                "slug": slug,
                "order": order,
                "roleLabel": role_label,
                "legacyModalId": modal_id,
                "defaultTab": default_tab,
                "bio": strip_tags(bio_match.group(1)) if bio_match else "",
                "image": image_match.group(1) if image_match else "",
                "functional": functional,
                "industry": industry,
            }
        )
    return sorted(people, key=lambda person: person["order"])


def extract_services(text: str) -> list[dict]:
    service_meta = [
        ("operations", 1, "Optimize Your Workflow", "modal"),
        ("finance", 2, "Trust Your Numbers", "modal-2"),
        ("digital", 3, "Elevate Your Presence", "modal-3"),
        ("hr", 4, "Build Stronger Teams", "modal-4"),
    ]
    services: list[dict] = []
    blocks = text.split("fs_modal-1_wrapper-2 people")[1:5]
    for (slug, order, card_heading, modal_id), block in zip(service_meta, blocks):
        card_index = text.find(card_heading)
        card_snippet = text[card_index : card_index + 10000]
        card_body_match = re.search(
            r'<p class="text-size-medium text-color-grey">(.*?)</p>', card_snippet, re.DOTALL
        )
        card_image_match = re.search(
            r'src="([^"]+)"[^>]*class="layout507_image"', card_snippet
        ) or re.search(r'class="layout507_image"[^>]*src="([^"]+)"', card_snippet)
        modal_heading_match = re.search(r'<h2 class="heading-style-h3">([^<]+)</h2>', block)
        modal_subheading_match = re.search(
            r'<p class="text-size-medium-smallspace text-color-grey">(.*?)</p>', block, re.DOTALL
        )
        modal_image_match = re.search(
            r'class="layout507_image"[^>]*src="([^"]+)"', block
        ) or re.search(r'src="([^"]+)"[^>]*class="layout507_image"', block)
        sub_services = [
            {"title": strip_tags(title), "description": strip_tags(description)}
            for title, description in re.findall(
                r'<h3 class="heading-style-h6">([^<]+)</h3>.*?<p class="text-size-small text-color-grey">(.*?)</p>',
                block,
                re.DOTALL,
            )
        ]
        services.append(
            {
                "name": slug.title(),
                "slug": slug,
                "order": order,
                "cardHeading": card_heading,
                "cardBody": strip_tags(card_body_match.group(1)) if card_body_match else "",
                "cardImage": card_image_match.group(1) if card_image_match else "",
                "cardImageAlt": card_heading,
                "modalHeading": strip_tags(modal_heading_match.group(1)) if modal_heading_match else "",
                "modalSubheading": strip_tags(modal_subheading_match.group(1)) if modal_subheading_match else "",
                "modalImage": modal_image_match.group(1) if modal_image_match else "",
                "modalImageAlt": strip_tags(modal_heading_match.group(1)) if modal_heading_match else "",
                "subServices": sub_services,
                "legacyModalId": modal_id,
            }
        )
    return services


def extract_industries(text: str) -> list[dict]:
    labels = [
        ("landscape-maintenance", 1, "Landscape Maintenance", "Tab 1"),
        ("snow-removal", 2, "Snow Removal", "Tab 2"),
        ("landscape-construction-builders", 3, "Landscape Construction & Builders", "Tab 3"),
    ]
    section = text[text.find('id="industries"') : text.find('id="industries"') + 15000]
    industries: list[dict] = []
    for slug, order, label, tab in labels:
        label_index = section.find(label)
        label_snippet = section[label_index : label_index + 1200]
        body_match = re.search(
            r'<p class="text-size-small text-color-grey">(.*?)</p>', label_snippet, re.DOTALL
        )
        pane_match = re.search(
            rf'data-w-tab="{tab}" class="layout493_tab-pane[^"]*".*?src="([^"]+)".*?class="(layout493_image[^"]*)"',
            section,
            re.DOTALL,
        )
        if not pane_match:
            pane_match = re.search(
                rf'data-w-tab="{tab}" class="layout493_tab-pane[^"]*".*?class="(layout493_image[^"]*)"[^>]*src="([^"]+)"',
                section,
                re.DOTALL,
            )
            image_class = pane_match.group(1).replace("layout493_image", "").strip() if pane_match else None
            image_url = pane_match.group(2) if pane_match else ""
        else:
            image_url = pane_match.group(1)
            image_class = pane_match.group(2).replace("layout493_image", "").strip() or None
        industries.append(
            {
                "name": label,
                "slug": slug,
                "order": order,
                "tabLabel": label,
                "body": strip_tags(body_match.group(1)) if body_match else "",
                "image": image_url,
                "imageAlt": label,
                "imageClass": image_class,
            }
        )
    return industries


def extract_testimonials(text: str) -> list[dict]:
    order_names = [
        "Will Jameson",
        "Elliott MacIsaac",
        "Mark Meahl",
        "Alex Ostblom",
        "Jamie Brady",
        "Ramu Veerappan",
    ]
    slides: dict[str, dict] = {}
    for part in text.split("testimonial23_card ")[1:]:
        color = part.split('"', 1)[0]
        quote_match = re.search(r'class="text-size-medium">(.*?)</div>', part, re.DOTALL)
        name_match = re.search(r"<strong>([^<]+)</strong>", part)
        title_match = re.search(r"</strong></div><motion><div>([^<]+)</div>", part) or re.search(
            r"</strong></div><motion><motion><div>([^<]+)</motion></motion></div>", part
        )
        image_match = re.search(
            r'testimonial23_customer-image"[^>]*src="([^"]+)"', part
        ) or re.search(r'src="([^"]+)"[^>]*testimonial23_customer-image', part)
        if not name_match or not quote_match:
            continue
        name = strip_tags(name_match.group(1))
        slides[name] = {
            "name": name,
            "slug": slugify(name),
            "quote": strip_tags(quote_match.group(1)),
            "title": strip_tags(title_match.group(1)) if title_match else "",
            "color": color,
            "image": image_match.group(1) if image_match else "",
            "portraitAlt": name,
        }
    testimonials: list[dict] = []
    for order, name in enumerate(order_names, start=1):
        if name not in slides:
            raise KeyError(name)
        testimonials.append({"order": order, **slides[name]})
    return testimonials


def extract_client_logos(text: str) -> list[dict]:
    index = text.find("logo3_list-3")
    snippet = text[index : index + 25000]
    entries: list[dict] = []
    for image_match in re.finditer(
        r'<img[^>]+src="([^"]+)"[^>]*class="logo3_logo([^"]*)"', snippet
    ):
        src = image_match.group(1)
        classes = image_match.group(2).strip().split()
        size_class = next(
            (token for token in classes if token in {"max-1-75", "max-2", "max-2-25", "max-3", "osprey"}),
            None,
        )
        if src.startswith("local-brand-logos/"):
            local_name = Path(src).stem.replace("-", " ").title()
            entries.append(
                {
                    "name": local_name,
                    "slug": slugify(local_name),
                    "image": src,
                    "sizeClass": None,
                    "logoAlt": local_name,
                    "externalUrl": None,
                }
            )
            continue
        filename = src.split("/")[-1]
        readable = strip_tags(filename.split("_", 1)[-1].rsplit(".", 1)[0].replace("%20", " "))
        entries.append(
            {
                "name": readable,
                "slug": slugify(readable),
                "image": src,
                "sizeClass": size_class,
                "logoAlt": readable,
                "externalUrl": None,
            }
        )
    unique: list[dict] = []
    seen: set[str] = set()
    for entry in entries:
        if entry["image"] in seen:
            continue
        seen.add(entry["image"])
        unique.append(entry)
    return [{**entry, "order": index + 1} for index, entry in enumerate(unique[:15])]


def main() -> None:
    text = HTML.read_text(encoding="utf-8")
    for person in extract_team(text):
        headshot = copy_asset(person["image"], ASSETS / "team", f"{person['slug']}{Path(person['image']).suffix.split('?')[0]}")
        write_md(
            CONTENT / "team" / f"{person['slug']}.md",
            {
                "name": person["name"],
                "slug": person["slug"],
                "order": person["order"],
                "roleLabel": person["roleLabel"],
                "headshot": headshot,
                "headshotAlt": person["name"],
                "bio": person["bio"],
                "functionalExpertise": person["functional"],
                "industryExperience": person["industry"],
                "defaultTab": person["defaultTab"],
                "legacyModalId": person["legacyModalId"],
            },
        )
    for service in extract_services(text):
        card_image = copy_asset(
            service["cardImage"],
            ASSETS / "services",
            f"{service['slug']}-card{Path(service['cardImage']).suffix.split('?')[0]}",
        )
        modal_image = copy_asset(
            service["modalImage"],
            ASSETS / "services",
            f"{service['slug']}-modal{Path(service['modalImage']).suffix.split('?')[0]}",
        )
        write_md(
            CONTENT / "services" / f"{service['slug']}.md",
            {
                "name": service["name"],
                "slug": service["slug"],
                "order": service["order"],
                "cardHeading": service["cardHeading"],
                "cardBody": service["cardBody"],
                "cardImage": card_image,
                "cardImageAlt": service["cardImageAlt"],
                "modalHeading": service["modalHeading"],
                "modalSubheading": service["modalSubheading"],
                "modalImage": modal_image,
                "modalImageAlt": service["modalImageAlt"],
                "subServices": service["subServices"],
                "legacyModalId": service["legacyModalId"],
            },
        )
    for industry in extract_industries(text):
        image = copy_asset(
            industry["image"],
            ASSETS / "industries",
            f"{industry['slug']}{Path(industry['image']).suffix.split('?')[0]}",
        )
        write_md(
            CONTENT / "industries" / f"{industry['slug']}.md",
            {
                "name": industry["name"],
                "slug": industry["slug"],
                "order": industry["order"],
                "tabLabel": industry["tabLabel"],
                "body": industry["body"],
                "image": image,
                "imageAlt": industry["imageAlt"],
                "imageClass": industry["imageClass"],
            },
        )
    for testimonial in extract_testimonials(text):
        portrait = copy_asset(
            testimonial["image"],
            ASSETS / "testimonials",
            f"{testimonial['slug']}{Path(testimonial['image']).suffix.split('?')[0]}",
        )
        write_md(
            CONTENT / "testimonials" / f"{testimonial['slug']}.md",
            {
                "name": testimonial["name"],
                "slug": testimonial["slug"],
                "order": testimonial["order"],
                "quote": testimonial["quote"],
                "title": testimonial["title"],
                "color": testimonial["color"],
                "portrait": portrait,
                "portraitAlt": testimonial["portraitAlt"],
            },
        )
    for logo in extract_client_logos(text):
        image = copy_asset(
            logo["image"],
            ASSETS / "logos",
            f"{logo['slug']}{Path(logo['image']).suffix.split('?')[0]}",
        )
        write_md(
            CONTENT / "client-logos" / f"{logo['slug']}.md",
            {
                "name": logo["name"],
                "slug": logo["slug"],
                "order": logo["order"],
                "logo": image,
                "logoAlt": logo["logoAlt"],
                "sizeClass": logo["sizeClass"],
                "externalUrl": logo["externalUrl"],
            },
        )
    CREATED.append("src/content.config.ts")
    print("\n".join(sorted(set(CREATED))))


if __name__ == "__main__":
    main()
