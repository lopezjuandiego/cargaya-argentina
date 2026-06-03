#!/usr/bin/env python3
"""Apply font scaling to all remaining IG carousel HTML files.
Run from any directory: python3 scripts/patch-ig-fonts.py
"""
import os

BASE = "/home/lenovolenovo/Juancho/mapaEV/public/ig"

def patch(path, replacements):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    count = 0
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            count += 1
        else:
            label = path.split("/ig/")[1]
            print(f"  ⚠  not found in {label}: ...{old[-50:]!r}")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    label = path.split("/ig/")[1]
    print(f"  ✓  {label}: {count}/{len(replacements)} applied")

# ─── COMMON PATCHES FOR POST FILES ──────────────────────────────────────────
# Reference: ansiedad/carousel-post.html (already updated)

POST_COMMON = [
    # Header text
    (".hdr-name { font-size: 18px", ".hdr-name { font-size: 26px"),
    (".hdr-handle { font-size: 12px", ".hdr-handle { font-size: 18px"),
    # hdr-num (unique background #1a1f2e + padding 4px 12px)
    ("font-size: 12px; color: #4b5563; font-weight: 600; background: #1a1f2e; padding: 4px 12px",
     "font-size: 18px; color: #4b5563; font-weight: 600; background: #1a1f2e; padding: 6px 14px"),
    # tag
    ("font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 5px 13px",
     "font-size: 18px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 7px 16px"),
    # Footer
    (".ftr-l { font-size: 14px", ".ftr-l { font-size: 30px"),
    # ftr-r (background: #111827 + padding: 6px 14px + border-radius: 8px)
    ("font-size: 12px; color: #4b5563; background: #111827; padding: 6px 14px; border-radius: 8px",
     "font-size: 26px; color: #4b5563; background: #111827; padding: 10px 18px; border-radius: 8px"),
    # Cover
    (".cover-text p { font-size: 22px", ".cover-text p { font-size: 34px"),
    # data-body
    (".data-body { flex: 1; padding: 28px 64px 0; display: flex; flex-direction: column; gap: 18px",
     ".data-body { flex: 1; padding: 22px 64px 0; display: flex; flex-direction: column; gap: 14px"),
    (".data-body h2 { font-size: 42px", ".data-body h2 { font-size: 62px"),
    # facts
    (".facts { display: flex; flex-direction: column; gap: 14px",
     ".facts { display: flex; flex-direction: column; gap: 12px"),
    (".fact { background: rgba(26,31,46,0.95); border-radius: 16px; padding: 20px 22px; border: 1px solid #1f2937; display: flex; gap: 16px",
     ".fact { background: rgba(26,31,46,0.95); border-radius: 16px; padding: 22px 26px; border: 1px solid #1f2937; display: flex; gap: 20px"),
    # f-content
    (".f-icon { font-size: 28px", ".f-icon { font-size: 44px"),
    (".f-title { font-size: 16px", ".f-title { font-size: 42px"),
    (".f-desc { font-size: 13px", ".f-desc { font-size: 38px"),
    ("margin-top: 6px; font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 7px; width: fit-content;",
     "margin-top: 6px; font-size: 30px; font-weight: 700; padding: 8px 18px; border-radius: 7px; width: fit-content;"),
    # CTA
    (".cta-main { font-size: 17px", ".cta-main { font-size: 44px"),
    (".cta-url { font-size: 13px", ".cta-url { font-size: 34px"),
]

POST_H1_64 = [(".cover-text h1 { font-size: 64px", ".cover-text h1 { font-size: 84px")]
POST_H1_68 = [(".cover-text h1 { font-size: 68px", ".cover-text h1 { font-size: 84px")]
POST_SPLIT = [(".split-content h2 { font-size: 38px", ".split-content h2 { font-size: 58px")]

POST_TCELL_13 = [
    (".t-cell { font-size: 13px; color: #9ca3af;", ".t-cell { font-size: 26px; color: #9ca3af;"),
    (".t-row.head .t-cell { font-size: 11px", ".t-row.head .t-cell { font-size: 22px"),
]

POST_COSTA_EXTRA = [
    (".route-km { font-size: 13px", ".route-km { font-size: 26px"),
    (".route-place { font-size: 18px", ".route-place { font-size: 38px"),
    (".route-detail { font-size: 13px", ".route-detail { font-size: 32px"),
    (".route-badge { display: inline-block; margin-top: 6px; font-size: 12px; font-weight: 700; padding: 3px 10px",
     ".route-badge { display: inline-block; margin-top: 6px; font-size: 26px; font-weight: 700; padding: 7px 16px"),
]

POST_CARG_EXTRA = [
    (".lvl-icon { font-size: 32px", ".lvl-icon { font-size: 44px"),
    (".lvl-title { font-size: 16px; font-weight: 800;", ".lvl-title { font-size: 38px; font-weight: 800;"),
    (".lvl-sub { font-size: 12px; color: #6b7280;", ".lvl-sub { font-size: 28px; color: #6b7280;"),
    (".lvl-stat { font-size: 24px", ".lvl-stat { font-size: 52px"),
    (".lvl-detail { font-size: 12px; color: #9ca3af;", ".lvl-detail { font-size: 32px; color: #9ca3af;"),
    (".lvl-badge { margin-top: auto; display: inline-block; font-size: 12px; font-weight: 700; padding: 4px 10px",
     ".lvl-badge { margin-top: auto; display: inline-block; font-size: 28px; font-weight: 700; padding: 8px 16px"),
    (".t-cell { font-size: 12px; color: #9ca3af;", ".t-cell { font-size: 26px; color: #9ca3af;"),
    (".t-row.head .t-cell { font-size: 10px", ".t-row.head .t-cell { font-size: 22px"),
    (".hl-icon { font-size: 32px", ".hl-icon { font-size: 44px"),
    (".hl-title { font-size: 16px", ".hl-title { font-size: 38px"),
    (".hl-desc { font-size: 13px", ".hl-desc { font-size: 32px"),
]

# ─── APPLY POST PATCHES ──────────────────────────────────────────────────────
print("\n── POST FILES ──")

# cargadores-rapidos (h1: 64px, no split-content, has lvl/hl/t-cell)
patch(f"{BASE}/cargadores-rapidos/carousel-post.html",
      POST_COMMON + POST_H1_64 + POST_CARG_EXTRA)

# costa-atlantica (h1: 64px, has split-content + route-*)
patch(f"{BASE}/costa-atlantica/carousel-post.html",
      POST_COMMON + POST_H1_64 + POST_SPLIT + POST_COSTA_EXTRA)

# patente (h1: 68px, has split-content + t-cell 13px)
patch(f"{BASE}/patente/carousel-post.html",
      POST_COMMON + POST_H1_68 + POST_SPLIT + POST_TCELL_13)

# san-isidro (h1: 68px, has split-content + t-cell 13px)
patch(f"{BASE}/san-isidro/carousel-post.html",
      POST_COMMON + POST_H1_68 + POST_SPLIT + POST_TCELL_13)

# tigre (h1: 68px, has split-content + t-cell 13px)
patch(f"{BASE}/tigre/carousel-post.html",
      POST_COMMON + POST_H1_68 + POST_SPLIT + POST_TCELL_13)

# ─── COMMON PATCHES FOR STORY FILES (Group A) ───────────────────────────────
# These stories already have the larger story-scale base CSS:
# hdr-name: 20px, hdr-handle: 13px, hdr-num: 13px (padding 5px 14px),
# tag: 13px (padding 7px 16px), ftr-l: 17px, ftr-r: 15px (padding 8px 18px),
# h1: 100px, data-body h2: 62px, data-body gap: 28px

STORY_A_COMMON = [
    # Header
    (".hdr-name { font-size: 20px", ".hdr-name { font-size: 34px"),
    (".hdr-handle { font-size: 13px", ".hdr-handle { font-size: 24px"),
    # hdr-num (padding 5px 14px + background #1a1f2e)
    ("font-size: 13px; color: #4b5563; font-weight: 600; background: #1a1f2e; padding: 5px 14px",
     "font-size: 24px; color: #4b5563; font-weight: 600; background: #1a1f2e; padding: 8px 20px"),
    # tag (padding 7px 16px)
    ("font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 7px 16px; border-radius: 7px;",
     "font-size: 24px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 10px 22px; border-radius: 7px;"),
    # Footer
    (".ftr-l { font-size: 17px", ".ftr-l { font-size: 34px"),
    # ftr-r (padding 8px 18px + border-radius 10px)
    ("font-size: 15px; color: #4b5563; background: #111827; padding: 8px 18px; border-radius: 10px",
     "font-size: 28px; color: #4b5563; background: #111827; padding: 12px 22px; border-radius: 10px"),
    # Cover text
    (".cover-text p { font-size: 26px", ".cover-text p { font-size: 44px"),
    # data-body (gap: 28px → 18px for fit with larger content)
    ("padding: 48px 80px 0; display: flex; flex-direction: column; gap: 28px;",
     "padding: 48px 80px 0; display: flex; flex-direction: column; gap: 18px;"),
    # Stat
    (".stat-label { font-size: 28px", ".stat-label { font-size: 52px"),
    (".stat-sub { font-size: 22px", ".stat-sub { font-size: 40px"),
    ("font-size: 17px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 9px 20px; border-radius: 10px; margin-top: 10px;",
     "font-size: 34px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 14px 28px; border-radius: 10px; margin-top: 10px;"),
    # Bullets
    (".bullets { display: flex; flex-direction: column; gap: 20px; flex: 1;",
     ".bullets { display: flex; flex-direction: column; gap: 14px; flex: 1;"),
    (".bullet { background: #1a1f2e; border-radius: 22px; padding: 28px 36px; border: 1px solid #1f2937; display: flex; gap: 22px;",
     ".bullet { background: #1a1f2e; border-radius: 22px; padding: 22px 28px; border: 1px solid #1f2937; display: flex; gap: 18px;"),
    (".b-icon { font-size: 44px", ".b-icon { font-size: 46px"),  # slight bump
    (".b-title { font-size: 22px", ".b-title { font-size: 44px"),
    (".b-desc { font-size: 18px", ".b-desc { font-size: 36px"),
    (".b-badge { display: inline-block; margin-top: 10px; font-size: 16px; font-weight: 700; padding: 6px 14px; border-radius: 9px; width: fit-content;",
     ".b-badge { display: inline-block; margin-top: 10px; font-size: 32px; font-weight: 700; padding: 10px 20px; border-radius: 9px; width: fit-content;"),
    # Boxes
    (".box-title { font-size: 20px", ".box-title { font-size: 40px"),
    (".box-detail { font-size: 18px", ".box-detail { font-size: 36px"),
    # CTA
    (".cta-main { font-size: 26px", ".cta-main { font-size: 52px"),
    (".cta-url { font-size: 19px", ".cta-url { font-size: 38px"),
]

STORY_CARG_EXTRA = [
    # cargadores-rapidos story has lvl-* already larger (44px icon, 20px title, 15px sub...)
    (".lvl-title { font-size: 20px; font-weight: 800;", ".lvl-title { font-size: 42px; font-weight: 800;"),
    (".lvl-sub { font-size: 15px; color: #6b7280;", ".lvl-sub { font-size: 32px; color: #6b7280;"),
    (".lvl-stat { font-size: 32px", ".lvl-stat { font-size: 60px"),
    (".lvl-detail { font-size: 16px; color: #9ca3af;", ".lvl-detail { font-size: 36px; color: #9ca3af;"),
    (".lvl-badge { margin-top: auto; display: inline-block; font-size: 15px; font-weight: 700; padding: 6px 14px; border-radius: 9px;",
     ".lvl-badge { margin-top: auto; display: inline-block; font-size: 32px; font-weight: 700; padding: 10px 20px; border-radius: 9px;"),
    (".t-cell { font-size: 17px; color: #9ca3af;", ".t-cell { font-size: 36px; color: #9ca3af;"),
    (".t-row.head .t-cell { font-size: 13px", ".t-row.head .t-cell { font-size: 28px"),
]

STORY_COSTA_EXTRA = [
    (".route-km { font-size: 16px", ".route-km { font-size: 32px"),
    (".route-place { font-size: 26px", ".route-place { font-size: 48px"),
    (".route-detail { font-size: 19px", ".route-detail { font-size: 38px"),
    (".route-badge { display: inline-block; margin-top: 8px; font-size: 15px; font-weight: 700; padding: 5px 14px",
     ".route-badge { display: inline-block; margin-top: 8px; font-size: 32px; font-weight: 700; padding: 9px 20px"),
]

STORY_SI_TIGRE_TCELL = [
    (".t-cell { font-size: 18px; color: #9ca3af;", ".t-cell { font-size: 36px; color: #9ca3af;"),
    (".t-row.head .t-cell { font-size: 14px", ".t-row.head .t-cell { font-size: 28px"),
]

# ─── APPLY STORY GROUP A PATCHES ────────────────────────────────────────────
print("\n── STORY FILES (Group A) ──")

patch(f"{BASE}/ansiedad/carousel-story.html", STORY_A_COMMON)

patch(f"{BASE}/cargadores-rapidos/carousel-story.html",
      STORY_A_COMMON + STORY_CARG_EXTRA)

patch(f"{BASE}/costa-atlantica/carousel-story.html",
      STORY_A_COMMON + STORY_COSTA_EXTRA)

patch(f"{BASE}/san-isidro/carousel-story.html",
      STORY_A_COMMON + STORY_SI_TIGRE_TCELL)

patch(f"{BASE}/tigre/carousel-story.html",
      STORY_A_COMMON + STORY_SI_TIGRE_TCELL)

# ─── PATENTE STORY (mixed CSS: post-like hdr/ftr, story-scale h1/h2) ────────
# Safe zones already applied (252px top, 260px bottom).
# Still needs: hdr/ftr post-size → scaled up, content text upscale.
STORY_PATENTE = [
    # Header (post-like 18px/12px)
    (".hdr-name { font-size: 18px", ".hdr-name { font-size: 26px"),
    (".hdr-handle { font-size: 12px", ".hdr-handle { font-size: 18px"),
    ("font-size: 12px; color: #4b5563; font-weight: 600; background: #1a1f2e; padding: 4px 12px",
     "font-size: 18px; color: #4b5563; font-weight: 600; background: #1a1f2e; padding: 6px 14px"),
    ("font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 5px 13px",
     "font-size: 18px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 7px 16px"),
    (".ftr-l { font-size: 14px", ".ftr-l { font-size: 30px"),
    ("font-size: 12px; color: #4b5563; background: #111827; padding: 6px 14px; border-radius: 8px",
     "font-size: 26px; color: #4b5563; background: #111827; padding: 10px 18px; border-radius: 8px"),
    # Cover text
    (".cover-text p { font-size: 22px", ".cover-text p { font-size: 38px"),
    # f-content (already partially scaled: f-icon 38px, f-title 20px, f-desc 17px)
    (".f-icon { font-size: 38px", ".f-icon { font-size: 50px"),
    (".f-title { font-size: 20px; font-weight: 700;", ".f-title { font-size: 44px; font-weight: 700;"),
    (".f-desc { font-size: 17px; color: #9ca3af;", ".f-desc { font-size: 38px; color: #9ca3af;"),
    ("margin-top: 6px; font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 7px; width: fit-content;",
     "margin-top: 6px; font-size: 30px; font-weight: 700; padding: 8px 18px; border-radius: 7px; width: fit-content;"),
    # t-cell
    (".t-cell { font-size: 17px; color: #9ca3af;", ".t-cell { font-size: 36px; color: #9ca3af;"),
    (".t-row.head .t-cell { font-size: 11px", ".t-row.head .t-cell { font-size: 24px"),
    # CTA (still at 17px/13px)
    (".cta-main { font-size: 17px", ".cta-main { font-size: 44px"),
    (".cta-url { font-size: 13px", ".cta-url { font-size: 38px"),
    # facts gap
    (".facts { display: flex; flex-direction: column; gap: 14px",
     ".facts { display: flex; flex-direction: column; gap: 12px"),
]

print("\n── STORY FILES (special) ──")
patch(f"{BASE}/patente/carousel-story.html", STORY_PATENTE)

# ─── CASA STORY ──────────────────────────────────────────────────────────────
# Multi-line CSS, unique components: .lvl, .step-*, .roi-*
# Group A hdr/ftr same values (20px name, 13px handle, 15px ftr-r)
STORY_CASA = [
    # hdr/ftr (multi-line CSS — match key unique substrings)
    ("font-size: 20px; font-weight: 700; color: #f9fafb; }",
     "font-size: 34px; font-weight: 700; color: #f9fafb; }"),
    ("font-size: 13px; color: #6b7280; margin-top: 1px; }",
     "font-size: 24px; color: #6b7280; margin-top: 1px; }"),
    # hdr-num (background: #1a1f2e + padding: 5px 14px — multi-line)
    ("background: #1a1f2e; padding: 5px 14px; border-radius: 20px; border: 1px solid #1f2937;",
     "background: #1a1f2e; padding: 8px 20px; border-radius: 20px; border: 1px solid #1f2937;"),
    ("font-size: 13px; color: #4b5563; font-weight: 600;",
     "font-size: 24px; color: #4b5563; font-weight: 600;"),
    # tag (multi-line) — font-size: 13px + padding: 7px 16px
    ("padding: 7px 16px; border-radius: 7px; }",
     "padding: 10px 22px; border-radius: 7px; }"),
    # ftr-l (multi-line)
    ("font-size: 17px; font-weight: 600; color: #d1d5db; }",
     "font-size: 34px; font-weight: 600; color: #d1d5db; }"),
    # ftr-r
    ("font-size: 15px; color: #4b5563; background: #111827; padding: 8px 18px; border-radius: 10px; border: 1px solid #1f2937; }",
     "font-size: 28px; color: #4b5563; background: #111827; padding: 12px 22px; border-radius: 10px; border: 1px solid #1f2937; }"),
    # cover text
    (".cover-text p { font-size: 26px", ".cover-text p { font-size: 44px"),
    # b-content
    (".b-title { font-size: 22px", ".b-title { font-size: 44px"),
    (".b-desc { font-size: 19px", ".b-desc { font-size: 38px"),  # casa has 19px not 18px
    # lvl content
    (".lvl-title { font-size: 26px", ".lvl-title { font-size: 50px"),
    (".lvl-sub { font-size: 16px", ".lvl-sub { font-size: 34px"),
    (".lvl-txt { font-size: 19px", ".lvl-txt { font-size: 38px"),
    # step content
    (".step-t { font-size: 22px", ".step-t { font-size: 44px"),
    (".step-d { font-size: 18px", ".step-d { font-size: 36px"),
    # roi
    (".roi-title { font-size: 16px", ".roi-title { font-size: 36px"),
    # CTA
    (".cta-main { font-size: 26px", ".cta-main { font-size: 52px"),
    (".cta-url { font-size: 19px", ".cta-url { font-size: 38px"),
]

patch(f"{BASE}/casa/carousel-story.html", STORY_CASA)

print("\n✓ All patches applied.\n")
