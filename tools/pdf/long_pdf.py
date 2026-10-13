"""One long scrolling PDF from the parts vector_pdf.js printed (parts/<name>.pdf + .json).

Each part is a real PDF page (text, vectors, links). Here every part's pictures are recompressed
to JPEG at twice their on-page size, the spare space under each part is trimmed, and the parts are
cut into pages at the gaps between sections (900-1800 px tall, each project starting on a new
page), with every link carried over. The cover's contents rows jump to their project.
Set the viewer to continuous scrolling and it reads as one long page.

Run from tools/pdf:  py long_pdf.py [quality]
"""
import json, os, sys
import pymupdf as fitz

NAMES = ['cover', 'uls', 'iccc-surveillance', 'canva-ai', 'relique']
Q = int(sys.argv[1]) if len(sys.argv) > 1 else 76
MAXW = int(sys.argv[2]) if len(sys.argv) > 2 else 2400
DENSITY = float(sys.argv[3]) if len(sys.argv) > 3 else 1.5
W = 1440                      # page width in points (1 css px = 1pt)
MIN, MAX = 900, 1800          # page height range, in css px
PAD = 64                      # the margin above and below every page's content
SELF = os.environ.get('SELF') == '1'      # the self-contained copy (see vector_pdf.js)
DIR = 'parts-self' if SELF else 'parts'
OUT = 'D:/Submissions/CV/Rutujeet Nayak Portfolio 2026%s.pdf' % (' - Ather' if SELF else '')


def recompress(doc, quality, maxw):
    """Re-encode every picture as JPEG in place (same object, so patterns that point at it still
    work; pymupdf's rewrite_images drops those). Wider than maxw is scaled down; very wide
    diagrams keep more width so they stay legible when zoomed."""
    import io
    from PIL import Image, ImageFile
    ImageFile.MAXBLOCK = 2 ** 26   # optimize=True needs room for big pictures
    seen = set()
    # how wide each picture is drawn, in points (1440 css px = 432pt, so 1 css px = 0.3pt)
    shown = {}
    for info in doc[0].get_image_info(xrefs=True):
        if info['xref']:
            shown[info['xref']] = max(shown.get(info['xref'], 0), fitz.Rect(info['bbox']).width)
    for item in doc[0].get_images(full=True):
        x = item[0]
        if x in seen:
            continue
        seen.add(x)
        if doc.xref_get_key(x, 'ImageMask')[1] == 'true':
            continue
        try:
            pix = fitz.Pixmap(doc, x)
        except Exception:
            continue
        if pix.colorspace is None or pix.colorspace.n not in (1, 3):
            pix = fitz.Pixmap(fitz.csRGB, pix)
        if pix.alpha:
            pix = fitz.Pixmap(pix, 0)
        mode = 'L' if pix.n == 1 else 'RGB'
        im = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
        cap = maxw * 2 if im.width > im.height * 3 else maxw
        if x in shown:   # DENSITY pixels per css pixel it is drawn at
            cap = min(cap, max(400, round(shown[x] / 0.3 * DENSITY)))
        if im.width > cap and doc.xref_get_key(x, 'SMask')[0] == 'null':
            im = im.resize((cap, max(1, round(im.height * cap / im.width))), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=quality, optimize=True, progressive=False, subsampling=0 if quality >= 88 else 2)
        data = buf.getvalue()
        if len(data) >= len(doc.xref_stream_raw(x)):
            continue
        doc.update_stream(x, data, compress=False)
        doc.xref_set_key(x, 'Filter', '/DCTDecode')
        doc.xref_set_key(x, 'DecodeParms', 'null')
        doc.xref_set_key(x, 'Width', str(im.width))
        doc.xref_set_key(x, 'Height', str(im.height))
        doc.xref_set_key(x, 'BitsPerComponent', '8')
        doc.xref_set_key(x, 'ColorSpace', '/DeviceGray' if mode == 'L' else '/DeviceRGB')


def content_bottom(page):
    """Last row (in points) that differs from the colour at the very bottom of the page."""
    z = 0.25
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z))
    w, h, n, s = pix.width, pix.height, pix.n, pix.samples
    # Chromium leaves a white edge on the last rows; the paper under the deck is a few rows up
    ref = h - 8
    base = s[ref * pix.stride:ref * pix.stride + n]
    for y in range(ref, -1, -1):
        row = s[y * pix.stride:y * pix.stride + w * n]
        for x in range(0, w * n, n * 4):
            if sum(abs(row[x + c] - base[c]) for c in range(3)) > 12:
                return refine(page, (y + 1) / z, base)
    return page.rect.height


def refine(page, rough, base):
    """Pin the bottom found at low resolution down to a fraction of a point."""
    z = 4
    clip = fitz.Rect(0, max(0, rough - 12), page.rect.width, min(page.rect.height, rough + 12))
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    w, h, n, s = pix.width, pix.height, pix.n, pix.samples
    for y in range(h - 1, -1, -1):
        row = s[y * pix.stride:y * pix.stride + w * n]
        if any(sum(abs(row[x + c] - base[c]) for c in range(3)) > 12 for x in range(0, w * n, n * 2)):
            return clip.y0 + (y + 1) / z
    return rough


parts = []
for name in NAMES:
    d = fitz.open(f'{DIR}/{name}.pdf')
    assert len(d) == 1, (name, len(d))
    recompress(d, 90 if name == 'cover' else Q, MAXW)
    meta = json.load(open(f'{DIR}/{name}.json'))
    bottom = meta['H'] * meta['scale'] * 0.75 if name == 'cover' else content_bottom(d[0])
    parts.append((name, d, bottom, meta))

def bands(page):
    """Runs of plain background rows (no text, no picture) in a part, in points: (start, end)."""
    pix = page.get_pixmap(matrix=fitz.Matrix(1, 1))
    w, h, n, s = pix.width, pix.height, pix.n, pix.samples
    out, start = [], None
    for y in range(h):
        row = s[y * pix.stride:y * pix.stride + w * n]
        first = row[:3]
        plain = all(sum(abs(row[x + c] - first[c]) for c in range(3)) <= 6 for x in range(0, w * n, n * 3))
        if plain and start is None:
            start = y
        elif not plain and start is not None:
            out.append((start, y)); start = None
    if start is not None:
        out.append((start, h))
    return out


def cuts(page, bottom):
    """Where to break a part into pages: in the tallest gap that leaves a page between MIN and MAX
    css px, so pages end between sections, never through a paragraph or a picture."""
    pt = 0.3                                  # 1 css px = 0.3pt on a part
    lo, hi = MIN * pt, MAX * pt
    every = [(a, b) for a, b in bands(page) if a < bottom]
    gaps = [(a, b) for a, b in every if b - a >= 6]       # 20+ css px: between sections
    small = [(a, b) for a, b in every if b - a >= 3]      # 10+ css px: between cards
    out, y = [0.0], 0.0
    while bottom - y > hi:
        c = None
        for pool, unit in ((gaps, 6), (small, 3)):   # prefer a gap between sections
            win = [(a, b) for a, b in pool if y + lo <= (a + b) / 2 <= y + hi]
            if win:
                a, b = max(win, key=lambda g: (round((g[1] - g[0]) / unit), (g[0] + g[1]) / 2))
                c = (a + b) / 2
                break
        if c is None:
            # nothing in range (one tall picture): run on to the next gap after it
            later = [(a + b) / 2 for a, b in small if (a + b) / 2 > y + hi]
            if not later:
                break
            c = min(later)
        out.append(c); y = c
    if bottom - y < lo / 2 and len(out) > 1:   # a stub at the end joins the page before it
        out.pop()
    out.append(bottom)
    return out, every


def bands(page):
    """Runs of plain background rows (no text, no picture) in a part, in points: (start, end)."""
    pix = page.get_pixmap(matrix=fitz.Matrix(1, 1))
    w, h, n, s = pix.width, pix.height, pix.n, pix.samples
    out, start = [], None
    for y in range(h):
        row = s[y * pix.stride:y * pix.stride + w * n]
        first = row[:3]
        plain = all(sum(abs(row[x + c] - first[c]) for c in range(3)) <= 6 for x in range(0, w * n, n * 3))
        if plain and start is None:
            start = y
        elif not plain and start is not None:
            out.append((start, y)); start = None
    if start is not None:
        out.append((start, h))
    return out


def band_at(bs, y):
    for a, b in bs:
        if a - 0.5 <= y <= b + 0.5:
            return a, b
    return None


def colour_at(doc, y):
    """The plain background colour of a part at height y, as a 0-1 RGB tuple."""
    pix = doc[0].get_pixmap(matrix=fitz.Matrix(1, 1), clip=fitz.Rect(0, max(0, y - 1), 4, y + 1))
    return tuple(v / 255 for v in pix.pixel(1, 0)[:3])


out = fitz.open()
k = W / parts[0][1][0].rect.width            # part points to page points
pages = []                                    # (part name, part doc, y0, y1, pad top, pad bottom, colours)
for name, d, bottom, meta in parts:
    if name == 'cover':
        pages.append((name, d, 0.0, bottom, 0, 0, None, None)); continue
    cs, bs = cuts(d[0], bottom)
    for j, (y0, y1) in enumerate(zip(cs, cs[1:])):
        pt = pb = 0
        ct = cb = None
        # every page edge gets the same margin: trim the gap back to the content, then pad
        if j > 0 and band_at(bs, y0):
            ct = colour_at(d, y0); y0 = band_at(bs, y0)[1]; pt = PAD
        g = band_at(bs, y1 - 1) if y1 >= bottom else band_at(bs, y1)
        if g:
            cb = colour_at(d, min(y1, g[1]) - 1); y1 = g[0]; pb = PAD
        pages.append((name, d, y0, y1, pt, pb, ct, cb))

starts, links, go = {}, [], []
for i, (name, d, y0, y1, pt, pb, ct, cb) in enumerate(pages):
    src = d[0]
    h = (y1 - y0) * k
    page = out.new_page(width=W, height=pt + h + pb)
    if pt:
        page.draw_rect(fitz.Rect(0, 0, W, pt + 1), color=None, fill=ct)
    if pb:
        page.draw_rect(fitz.Rect(0, pt + h - 1, W, pt + h + pb), color=None, fill=cb)
    page.show_pdf_page(fitz.Rect(0, pt, W, pt + h), d, 0, clip=fitz.Rect(0, y0, src.rect.width, y1))
    starts.setdefault(name, i)
    for l in src.get_links():
        r = l['from']
        if not l.get('uri') or r.y1 <= y0 or r.y0 >= y1:
            continue
        rr = fitz.Rect(r.x0 * k, pt + (max(r.y0, y0) - y0) * k, r.x1 * k, pt + (min(r.y1, y1) - y0) * k)
        if rr.height < 12 and r.height * k > 24:   # a sliver of a link's empty padding past a cut
            continue
        page.insert_link({'kind': fitz.LINK_URI, 'from': rr, 'uri': l['uri']})
        links.append(l['uri'])
    if name == 'cover':
        meta = [m for n, _, _, m in parts if n == 'cover'][0]
        f = meta['scale'] * 0.75 * k
        go = [(i, fitz.Rect(g['x'] * f, g['y'] * f, (g['x'] + g['w']) * f, (g['y'] + g['h']) * f), g['to']) for g in meta['go']]
for pno, r, to in go:
    out[pno].insert_link({'kind': fitz.LINK_GOTO, 'from': r, 'page': starts[to], 'to': fitz.Point(0, 0), 'zoom': 0})
out.set_metadata({'title': 'Rutujeet Nayak, Portfolio 2026', 'author': 'Rutujeet Nayak'})
out.set_pagelayout('OneColumn')
out.save(OUT, garbage=4, deflate=True, deflate_images=True, deflate_fonts=True)
hs = [round(p.rect.height) for p in out]
print(len(hs), 'pages, heights', min(hs[1:]), '-', max(hs), {n: i + 1 for n, i in starts.items()})
print(OUT, round(os.path.getsize(OUT) / 2**20, 2), 'MB', 'links', len(links), 'jumps', len(go))
