#!/usr/bin/env python3
import re
import shutil
from pathlib import Path
from datetime import datetime

REPO = Path.cwd()

BG_PAGES = {
    "index.html",
    "artikels.html",
    "events.html",
    "algemene-events.html",
    "clubvacatures.html",
    "trainers.html",
    "spelers.html",
    "gebruiksvoorwaarden.html",
    "privacyverklaring.html",
    "contact.html",
}

LOGO_PATH = "assets/img/brand/voetbal4all-logo-glow.png"
BODY_CLASS = "v4a-bg"

ts = datetime.now().strftime("%Y%m%d-%H%M%S")
BACKUP_DIR = REPO / f"_backup_brand_{ts}"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

def backup_file(p: Path):
    rel = p.relative_to(REPO)
    dest = BACKUP_DIR / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(p, dest)

def ensure_body_tag(html: str) -> str:
    # If <body ...> exists, do nothing here.
    if re.search(r"<body\b", html, flags=re.I):
        return html

    # Common broken pattern we saw: after </head> we have stray `class="..."` without <body
    # Insert a proper <body> right after </head>
    m = re.search(r"</head\s*>", html, flags=re.I)
    if not m:
        return html  # weird file; skip

    insert_at = m.end()

    # If immediately after </head> there is a stray class="..." line, remove it
    # Example: '\n\n class="v4a-bg v4a-bg">\n  <div class="page">'
    html_after = html[insert_at:]
    html_after = re.sub(r"^\s*class\s*=\s*\"[^\"]*\"\s*>", "", html_after, flags=re.I)

    body_open = f'\n\n<body>\n'
    return html[:insert_at] + body_open + html_after

def ensure_v4a_bg_on_body(html: str) -> str:
    # Add BODY_CLASS to <body ...> class attribute (or create class if missing)
    def repl(m):
        tag = m.group(0)

        # If there's class="..."
        cm = re.search(r'\bclass\s*=\s*(["\'])(.*?)\1', tag, flags=re.I|re.S)
        if cm:
            q = cm.group(1)
            cls = cm.group(2)
            if re.search(rf"\b{re.escape(BODY_CLASS)}\b", cls):
                # also collapse duplicate v4a-bg if present
                parts = [c for c in re.split(r"\s+", cls.strip()) if c]
                parts2 = []
                for c in parts:
                    if c == BODY_CLASS and BODY_CLASS in parts2:
                        continue
                    parts2.append(c)
                new_cls = " ".join(parts2)
            else:
                new_cls = (cls.strip() + " " + BODY_CLASS).strip()

            new_tag = re.sub(r'\bclass\s*=\s*(["\'])(.*?)\1',
                             lambda x: f'class={q}{new_cls}{q}',
                             tag, count=1, flags=re.I|re.S)
            return new_tag

        # No class attr: inject class="v4a-bg"
        tag2 = tag[:-1] + f' class="{BODY_CLASS}">'
        return tag2

    return re.sub(r"<body\b[^>]*>", repl, html, count=1, flags=re.I|re.S)

def normalize_brand_logo_imgs(html: str) -> str:
    # Replace any <img ... class="...brand-logo..." ...> with a canonical tag
    canonical = f'<img src="{LOGO_PATH}" alt="Voetbal4All" class="brand-logo" loading="eager" />'

    def img_repl(m):
        return canonical

    html2 = re.sub(
        r"<img\b[^>]*\bclass\s*=\s*(\"|')[^\"']*\bbrand-logo\b[^\"']*\1[^>]*>",
        img_repl,
        html,
        flags=re.I|re.S
    )

    # Remove accidental duplicate canonical logos back-to-back (keep first)
    html2 = re.sub(
        rf"({re.escape(canonical)}\s*){{2,}}",
        canonical + "\n",
        html2,
        flags=re.I|re.S
    )

    return html2

def main():
    html_files = sorted([p for p in REPO.glob("*.html") if p.is_file() and not p.name.startswith("_backup_")])
    if not html_files:
        print("ERROR: No root-level *.html files found. Run from repo root.")
        raise SystemExit(1)

    modified = []

    for p in html_files:
        original = p.read_text(encoding="utf-8", errors="replace")

        s = original

        # Always ensure <body> exists (fix broken pages)
        s = ensure_body_tag(s)

        # Apply v4a-bg only to BG_PAGES
        if p.name in BG_PAGES:
            s = ensure_v4a_bg_on_body(s)

        # Update brand logo img tags everywhere they exist
        if re.search(r"\bbrand-logo\b", s):
            s = normalize_brand_logo_imgs(s)

        if s != original:
            backup_file(p)
            p.write_text(s, encoding="utf-8")
            modified.append(p.name)

    print("✅ Brand fix done")
    print("Backup:", BACKUP_DIR.name)
    print("Modified files:")
    if modified:
        for f in modified:
            print(" -", f)
    else:
        print(" - (none)")

    # Sanity check
    fail = 0
    for name in sorted(BG_PAGES):
        p = REPO / name
        if not p.exists():
            continue
        s = p.read_text(encoding="utf-8", errors="replace")
        m = re.search(r"<body\b[^>]*>", s, flags=re.I|re.S)
        if not m:
            print("FAIL: no <body> tag:", name)
            fail = 1
            continue
        tag = m.group(0)
        if not re.search(r'\bclass\s*=\s*(["\']).*\bv4a-bg\b.*\1', tag, flags=re.I|re.S):
            print("FAIL: v4a-bg missing on body:", name)
            fail = 1
        else:
            print("PASS:", name)

    if fail:
        print("\n❌ Some BG pages still failing. Backup:", BACKUP_DIR.name)
        raise SystemExit(2)

    print("\n✅ All BG pages OK.")

if __name__ == "__main__":
    main()
