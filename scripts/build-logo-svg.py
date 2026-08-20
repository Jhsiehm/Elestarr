#!/usr/bin/env python3
"""Rebuild the official Elestar lockup as SVG from the source PNG.

The mark is a lattice of real circles. Isolated trail/rim dots keep their
measured centroids; the dense lens and handle use coverage-fitted radii so
the star punch stays open and the core reads solid.

The wordmark is traced from the official letterforms (not a substitute face).
Counters in e and a use fill-rule evenodd.
"""

from __future__ import annotations

import math
import shutil
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path("/Users/joshuaugyenlhundruphsiehmetters/Downloads/Hiring platform prototype")
OUT = ROOT / "src" / "assets"
PUBLIC = ROOT / "public"
SRC = OUT / "elestar-lockup-source.png"
if not SRC.exists():
    SRC = Path(
        "/Users/joshuaugyenlhundruphsiehmetters/.cursor/projects/Users-joshuaugyenlhundruphsiehmetters-Downloads-Hiring-platform-prototype/assets/PNG_image-85ff1dd8-b91b-4fb8-bb8b-89350b779ec4.png"
    )


def ink(img: np.ndarray) -> np.ndarray:
    return (255 - img.astype(np.float32)) / 255.0


def isolated_centroids(gray: np.ndarray) -> np.ndarray:
    inv = (255 - gray).astype(np.uint8)
    _, th = cv2.threshold(inv, 24, 255, cv2.THRESH_BINARY)
    n, _, stats, cents = cv2.connectedComponentsWithStats(th, connectivity=8)
    pts = []
    for i in range(1, n):
        area = int(stats[i, cv2.CC_STAT_AREA])
        w = int(stats[i, cv2.CC_STAT_WIDTH])
        h = int(stats[i, cv2.CC_STAT_HEIGHT])
        if 2 <= area <= 16 and w <= 6 and h <= 6:
            pts.append(cents[i])
    return np.array(pts, dtype=np.float64) if pts else np.zeros((0, 2))


def lattice_pitch(gray: np.ndarray) -> float:
    """Official lockup is a 4px square lattice (trail columns step 4 or 5)."""
    pts = isolated_centroids(gray)
    if len(pts) < 8:
        print("pitch 4.0 (fallback)")
        return 4.0
    same_row = []
    for i, p in enumerate(pts):
        dx = np.abs(pts[:, 0] - p[0])
        dy = np.abs(pts[:, 1] - p[1])
        cand = dx[(dy < 1.15) & (dx > 2.6) & (dx < 6.5)]
        if len(cand):
            same_row.append(float(cand.min()))
    px = float(np.median(same_row)) if same_row else 4.0
    # 5px steps are skipped trail cells; the lattice itself is 4
    pitch = 4.0 if 3.6 <= px <= 5.2 else px
    print("row-step median", px, "-> pitch", pitch, "n=", len(pts))
    return pitch


def fit_phase(field: np.ndarray, pitch: float, x1: int) -> tuple[float, float]:
    """Align lattice to isolated trail dots (left of the lens)."""
    trail = field[:, :x1]
    blur = cv2.GaussianBlur(trail, (0, 0), 0.4)
    best = (-1.0, 1.5, 1.5)
    steps = 24
    h, w = trail.shape
    for iy in range(steps):
        for ix in range(steps):
            ox = pitch * ix / steps
            oy = pitch * iy / steps
            score = 0.0
            n = 0
            y = oy
            while y < h - 0.5:
                x = ox
                while x < w - 0.5:
                    score += float(blur[int(round(y)), int(round(x))])
                    n += 1
                    x += pitch
                y += pitch
            mean = score / max(n, 1)
            if mean > best[0]:
                best = (mean, ox, oy)
    print("phase", best[1], best[2], "score", best[0])
    return best[1], best[2]


def star_mask(mark: np.ndarray) -> np.ndarray:
    """White astroid punch, sealed so the hole does not leak to the page."""
    inv = (255 - mark).astype(np.uint8)
    _, th = cv2.threshold(inv, 36, 255, cv2.THRESH_BINARY)
    closed = cv2.morphologyEx(th, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    cnts, hier = cv2.findContours(closed, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros(mark.shape, dtype=np.uint8)
    if hier is None:
        return mask
    best_i, best_a = -1, 0.0
    for i, c in enumerate(cnts):
        if hier[0, i, 3] != -1:
            continue
        a = cv2.contourArea(c)
        if a > best_a:
            best_a, best_i = a, i
    child = hier[0, best_i, 2]
    while child != -1:
        if cv2.contourArea(cnts[child]) > 400:
            cv2.drawContours(mask, cnts, child, 255, -1)
        child = hier[0, child, 0]
    # keep the punch slightly generous so rim circles do not eat the star points
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=1)
    return mask


def reconstruct_dots(mark: np.ndarray, pitch: float) -> list[tuple[float, float, float]]:
    """One circle per lattice cell. Cores fill; the star punch stays empty."""
    h, w = mark.shape
    field = ink(mark)
    ox, oy = fit_phase(field, pitch, min(100, w // 3))
    punch = star_mask(mark)
    blur = cv2.GaussianBlur(field, (0, 0), 0.4)
    r_max = pitch / math.sqrt(2)  # covers square-lattice corners so the core reads solid
    dots: list[tuple[float, float, float]] = []

    y = oy
    while y < h - 0.4:
        x = ox
        while x < w - 0.4:
            ix, iy = int(round(x)), int(round(y))
            if 0 <= iy < h and 0 <= ix < w and punch[iy, ix] == 0:
                v = float(blur[iy, ix])
                if v > 0.026:
                    rad = max(1, int(round(pitch * 0.45)))
                    y0, y1 = max(0, iy - rad), min(h, iy + rad + 1)
                    x0, x1 = max(0, ix - rad), min(w, ix + rad + 1)
                    yy, xx = np.ogrid[y0:y1, x0:x1]
                    circ = (xx - x) ** 2 + (yy - y) ** 2 <= (pitch * 0.45) ** 2
                    mass = float(field[y0:y1, x0:x1][circ].sum())
                    fill = mass / max(math.pi * (pitch * 0.45) ** 2, 1e-6)
                    r_eq = math.sqrt(max(mass, 0.0) / math.pi)
                    if fill >= 0.58:
                        r = r_max
                    else:
                        r = min(r_max * 0.92, max(r_eq, pitch * 0.08 + (fill**0.6) * r_max * 0.85))
                    if r > 0.20:
                        dots.append((x, y, float(r)))
            x += pitch
        y += pitch
    return dots


def contour_path(points: np.ndarray) -> str:
    """Dense polyline — cubics overshoot hairline serifs on a small raster."""
    pts = points.reshape(-1, 2).astype(np.float64)
    if len(pts) < 3:
        return ""
    if np.linalg.norm(pts[0] - pts[-1]) < 0.08:
        pts = pts[:-1]
    approx = cv2.approxPolyDP(pts.astype(np.float32), 0.14, True).reshape(-1, 2)
    if len(approx) < 3:
        approx = pts
    parts = [f"M{approx[0, 0]:.2f},{approx[0, 1]:.2f}"]
    for x, y in approx[1:]:
        parts.append(f"L{x:.2f},{y:.2f}")
    parts.append("Z")
    return " ".join(parts)


def trace_word(word: np.ndarray, origin: tuple[int, int]) -> tuple[str, list[np.ndarray]]:
    """Trace official letterforms. No unsharp — it fattens hairlines and fills counters."""
    scale = 8
    big = cv2.resize(
        word,
        (word.shape[1] * scale, word.shape[0] * scale),
        interpolation=cv2.INTER_LANCZOS4,
    )
    _, th = cv2.threshold(big, 168, 255, cv2.THRESH_BINARY_INV)
    contours, hierarchy = cv2.findContours(th, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    if hierarchy is None:
        return "", []
    ox, oy = origin
    paths: list[str] = []
    scaled: list[np.ndarray] = []
    for cnt in contours:
        if cv2.contourArea(cnt) < 90:
            continue
        pts = cnt.reshape(-1, 2).astype(np.float64) / scale + np.array([ox, oy], dtype=np.float64)
        scaled.append(pts)
        d = contour_path(pts)
        if d:
            paths.append(d)
    return " ".join(paths), scaled


def bin_radius(r: float, bins: np.ndarray) -> float:
    i = int(np.argmin(np.abs(bins - r)))
    return float(round(bins[i], 3))


def write_svg(path: Path, view: tuple[float, float, float, float], body: str, title: str, title_id: str) -> None:
    x, y, w, h = view
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.2f} {y:.2f} {w:.2f} {h:.2f}" fill="none" overflow="visible" role="img" aria-labelledby="{title_id}">
  <title id="{title_id}">{title}</title>
{body}
</svg>
'''
    path.write_text(svg)
    print("wrote", path, "bytes", path.stat().st_size)


def circles_group(dots_abs: list[tuple[float, float, float]], prefix: str) -> str:
    radii = [r for *_, r in dots_abs]
    bins = np.linspace(min(radii), max(radii), 36)
    binned: dict[float, list[tuple[float, float]]] = {}
    out: list[tuple[float, float, float]] = []
    for x, y, r in dots_abs:
        br = bin_radius(r, bins)
        binned.setdefault(br, []).append((x, y))
        out.append((x, y, br))
    defs = []
    uses = []
    for i, r in enumerate(sorted(binned)):
        ident = f"{prefix}{i}"
        defs.append(f'    <circle id="{ident}" r="{r:.3f}"/>')
        for x, y in binned[r]:
            uses.append(f'    <use href="#{ident}" x="{x:.2f}" y="{y:.2f}"/>')
    body = f'''  <defs>
{chr(10).join(defs)}
  </defs>
  <g fill="currentColor">
{chr(10).join(uses)}
  </g>'''
    return body, out


def main() -> None:
    gray = np.array(Image.open(SRC).convert("L"))
    h, w = gray.shape

    mark_box = (78, 70, 368, 300)
    word_box = (428, 88, 952, 292)
    mx0, my0, mx1, my1 = mark_box
    mark = gray[my0:my1, mx0:mx1]
    pitch = lattice_pitch(mark)
    print("pitch", pitch)
    dots_local = reconstruct_dots(mark, pitch)
    print("dots", len(dots_local))
    dots_abs = [(x + mx0, y + my0, r) for x, y, r in dots_local]

    wx0, wy0, wx1, wy1 = word_box
    word = gray[wy0:wy1, wx0:wx1]
    word_d, word_pts = trace_word(word, (wx0, wy0))
    print("word path chars", len(word_d), "contours", len(word_pts))

    pad = 10
    xs = [x for x, y, r in dots_abs]
    ys = [y for x, y, r in dots_abs]
    minx, maxx = min(xs) - pad, max(xs) + pad
    miny, maxy = min(ys) - pad, max(ys) + pad
    # include word
    minx = min(minx, wx0 - 4)
    maxx = max(maxx, wx1 + 4)
    miny = min(miny, wy0 - 6)
    maxy = max(maxy, wy1 + 6)

    mark_body, dots_binned = circles_group(dots_abs, "d")
    lockup_body = mark_body.replace(
        "  </g>",
        f'    <path fill="currentColor" fill-rule="evenodd" d="{word_d}"/>\n  </g>',
        1,
    )
    write_svg(
        OUT / "elestar-logo.svg",
        (minx, miny, maxx - minx, maxy - miny),
        lockup_body,
        "Elestar",
        "elestarTitle",
    )

    mx = min(x for x, y, r in dots_abs) - 6
    my = min(y for x, y, r in dots_abs) - 6
    Mx = max(x for x, y, r in dots_abs) + 6
    My = max(y for x, y, r in dots_abs) + 6
    mark_only, _ = circles_group(dots_abs, "m")
    write_svg(
        OUT / "elestar-mark.svg",
        (mx, my, Mx - mx, My - my),
        mark_only,
        "Elestar mark",
        "markTitle",
    )
    PUBLIC.mkdir(exist_ok=True)
    shutil.copyfile(OUT / "elestar-mark.svg", PUBLIC / "elestar-mark.svg")
    shutil.copyfile(OUT / "elestar-logo.svg", PUBLIC / "elestar-logo.svg")

    ts = [
        "export type LogoDot = { x: number; y: number; r: number }",
        "export const LOGO_DOTS: LogoDot[] = [",
    ]
    for x, y, r in dots_binned:
        ts.append(f"  {{ x: {x:.2f}, y: {y:.2f}, r: {r:.3f} }},")
    ts.append("]")
    ts.append(
        f"export const LOGO_MARK_BOX = {{ x: {mx:.1f}, y: {my:.1f}, w: {Mx - mx:.1f}, h: {My - my:.1f} }}"
    )
    (ROOT / "src" / "lib" / "logoDots.ts").write_text("\n".join(ts) + "\n")
    print("wrote logoDots.ts", len(dots_binned))


if __name__ == "__main__":
    main()
