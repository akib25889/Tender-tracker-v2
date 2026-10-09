#!/usr/bin/env python3
"""Verify the token palette in src/index.css against WCAG AA.

Why this exists
---------------
Two bugs in this project came from a colour that was correct in one theme and
unreadable in the other, and neither produced a type error, a console warning
or a layout break:

  * `text-white` on `bg-[var(--ok)]` — fine in light, 2.16:1 in dark.
  * `--text-muted` tuned against the card, then used on the darker canvas.

Nothing catches that except measuring it. Run this after any palette edit:

    python3 frontend/tools/check-contrast.py

Exits non-zero on the first failing pair, so it drops straight into CI.

Two tiers
---------
TEXT pairs need 4.5:1 (WCAG 1.4.3 AA, normal-size text).
GRAPHIC pairs need 3:1 (WCAG 1.4.11) and are measured against the colour
ADJACENT to them — a meter fill against its track, not against the page.
That distinction is why --warn and --warn-fill are separate tokens.
"""
import re, sys, pathlib

CSS = pathlib.Path(__file__).resolve().parent.parent / "src" / "index.css"

def _lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def luminance(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return .2126 * _lin(r) + .7152 * _lin(g) + .0722 * _lin(b)

def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + .05) / (lo + .05)

def parse(css):
    """Return {'light': {...}, 'dark': {...}} of token -> literal hex.
    var() aliases are resolved; a token defined only in :root carries into
    dark, which is exactly how the cascade behaves at runtime."""
    def body(opener):
        i = css.index(opener)
        return css[i:css.index("}", i)]
    light = dict(re.findall(r"(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{3,6})", body(":root {")))
    dark = dict(light)
    dark.update(dict(re.findall(r"(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{3,6})", body(".dark {"))))
    for scope, src in (("light", ":root {"), ("dark", ".dark {")):
        table = light if scope == "light" else dark
        for tok, ref in re.findall(r"(--[\w-]+)\s*:\s*var\((--[\w-]+)\)", body(src)):
            if ref in table:
                table[tok] = table[ref]
    return {"light": light, "dark": dark}

TEXT = [
    ("--text-primary", "--bg-surface"), ("--text-primary", "--bg-canvas"),
    ("--text-primary", "--bg-subtle"),  ("--text-primary", "--bg-input"),
    ("--text-primary", "--bg-muted"),   ("--text-primary", "--bg-dropdown"),
    ("--text-secondary", "--bg-surface"), ("--text-secondary", "--bg-canvas"),
    ("--text-secondary", "--bg-subtle"),
    ("--text-muted", "--bg-surface"), ("--text-muted", "--bg-canvas"),
    ("--text-muted", "--bg-subtle"),  ("--text-muted", "--bg-hover"),
    ("--accent-on", "--accent"),      ("--accent", "--accent-soft"),
    ("--accent", "--bg-surface"),     ("--accent", "--bg-canvas"),
    ("--text-link", "--bg-surface"),
    ("--ok", "--bg-surface"),   ("--ok", "--ok-soft"),     ("--ok", "--bg-canvas"),
    ("--warn", "--bg-surface"), ("--warn", "--warn-soft"), ("--warn", "--bg-canvas"),
    ("--crit", "--bg-surface"), ("--crit", "--crit-soft"), ("--crit", "--bg-canvas"),
]
GRAPHIC = [
    ("--text-faint", "--bg-surface"),
    ("--border-focus", "--bg-surface"),
    ("--ok-fill", "--bg-muted"), ("--warn-fill", "--bg-muted"), ("--crit-fill", "--bg-muted"),
    ("--accent", "--bg-muted"),
]

def main():
    themes = parse(CSS.read_text(encoding="utf-8"))
    fails = []
    checked = 0
    for theme, tokens in themes.items():
        for pairs, floor, kind in ((TEXT, 4.5, "text"), (GRAPHIC, 3.0, "graphic")):
            for fg, bg in pairs:
                if fg not in tokens or bg not in tokens:
                    fails.append((theme, kind, fg, bg, None, floor, "undefined token"))
                    continue
                checked += 1
                r = ratio(tokens[fg], tokens[bg])
                if r < floor:
                    fails.append((theme, kind, fg, bg, r, floor, f"{tokens[fg]} on {tokens[bg]}"))
    if fails:
        print(f"FAIL — {len(fails)} of {checked + len(fails)} pairs below floor\n")
        for theme, kind, fg, bg, r, floor, note in fails:
            got = f"{r:.2f}:1" if r else "  n/a "
            print(f"  [{theme:<5} {kind:<7}] {fg} on {bg}\n"
                  f"      {got}  (needs {floor}:1)   {note}")
        return 1
    print(f"PASS — {checked} token pairs meet WCAG AA "
          f"({len(TEXT)} text @4.5:1 and {len(GRAPHIC)} graphic @3:1, in both themes).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
