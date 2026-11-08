#!/usr/bin/env python3
"""Audit local links and same-page anchors in the generated static site.

Uses only Python's standard library so the check works on a clean GitHub runner.
"""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
import sys

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
BASE = "https://finance-os.invalid/"


class PageLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: set[str] = set()
        self.hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        values = dict(attrs)
        element_id = values.get("id")
        if element_id:
            self.ids.add(element_id)
        href = values.get("href")
        if tag.lower() == "a" and href:
            self.hrefs.append(href.strip())


def parse_page(path: Path) -> PageLinks:
    parser = PageLinks()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    parser.close()
    return parser


if not DIST.exists():
    print("Generated site is missing; run scripts/build_site.py first.")
    sys.exit(1)

issues: list[tuple[str, str, str]] = []
checked = 0
html_files = sorted(DIST.rglob("*.html"))
id_cache: dict[Path, set[str]] = {}

for file in html_files:
    rel = file.relative_to(DIST).as_posix()
    if rel == "index.html":
        page_url = BASE
    elif file.name == "index.html":
        page_url = urljoin(BASE, file.parent.relative_to(DIST).as_posix().rstrip("/") + "/")
    else:
        page_url = urljoin(BASE, rel)

    try:
        page = parse_page(file)
    except Exception as exc:  # keep audit output actionable for malformed files
        issues.append((rel, "parse", str(exc)))
        continue

    source_ids = page.ids
    for href in page.hrefs:
        if not href or href.startswith(("mailto:", "tel:", "javascript:", "data:", "blob:")):
            continue
        target_url = urljoin(page_url, href)
        parsed = urlparse(target_url)
        if parsed.scheme not in ("http", "https") or parsed.netloc != "finance-os.invalid":
            continue

        path = unquote(parsed.path or "/")
        if path in ("", "/"):
            target = DIST / "index.html"
        else:
            target = DIST / path.lstrip("/")
            if path.endswith("/") or target.is_dir():
                target = target / "index.html"

        checked += 1
        if not target.exists() or not target.is_file():
            issues.append((rel, "missing", href))
            continue

        if parsed.fragment and target.suffix.lower() == ".html":
            if target == file:
                target_ids = source_ids
            else:
                if target not in id_cache:
                    try:
                        id_cache[target] = parse_page(target).ids
                    except Exception as exc:
                        issues.append((rel, "parse-target", f"{href}: {exc}"))
                        continue
                target_ids = id_cache[target]

            if unquote(parsed.fragment) not in target_ids:
                issues.append((rel, "missing-anchor", href))

print(f"HTML files: {len(html_files)}; internal links checked: {checked}; issues: {len(issues)}")
for issue in issues[:100]:
    print(" -", *issue)
if issues:
    sys.exit(1)
