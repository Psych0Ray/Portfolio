"""One long scrolling PDF from the parts vector_pdf.js printed (parts/<name>.pdf + .json).

Each part is a real PDF page (text, vectors, links). Here every part's pictures are recompressed
to JPEG at twice their on-page size, the spare space under each part is trimmed, and the parts are
stacked on one page with every link carried over. The cover's contents rows jump to their project.

PDF viewers cap a page side at 14400 units, so the page is drawn at 1/8 and UserUnit 8 gives it
back its real size (1440pt wide).

Run from tools/pdf:  py long_pdf.py [quality]
"""
import json, os, sys
import pymupdf as fitz

NAMES = ['cover', 'uls', 'iccc-surveillance', 'canva-ai', 'relique']
Q = int(sys.argv[1]) if len(sys.argv) > 1 else 76
MAXW = int(sys.argv[2]) if len(sys.argv) > 2 else 2400
DENSITY = float(sys.argv[3]) if len(sys.argv) > 3 else 1.5
U = 8
W = 1440 / U                 # target width in page units
OUT = os.path.expanduser('~/Downloads/Rutujeet Nayak Portfolio 2026.pdf')


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
    d = fitz.open(f'parts/{name}.pdf')
    assert len(d) == 1, (name, len(d))
    recompress(d, 90 if name == 'cover' else Q, MAXW)
    meta = json.load(open(f'parts/{name}.json'))
    bottom = meta['H'] * meta['scale'] * 0.75 if name == 'cover' else content_bottom(d[0])
    parts.append((name, d, bottom, meta))

out = fitz.open()
k = W / parts[0][1][0].rect.width
H = sum(b for _, _, b, _ in parts) * k
assert H <= 14400, H
page = out.new_page(width=W, height=H)
y = 0
starts = {}
links = []
for name, d, bottom, meta in parts:
    src = d[0]
    clip = fitz.Rect(0, 0, src.rect.width, bottom)
    dest = fitz.Rect(0, y, W, y + bottom * k)
    page.show_pdf_page(dest, d, 0, clip=clip)
    starts[name] = y
    for l in src.get_links():
        r = l['from']
        if r.y0 >= bottom or not l.get('uri'):
            continue
        links.append((fitz.Rect(r.x0 * k, y + r.y0 * k, r.x1 * k, y + min(r.y1, bottom) * k), l['uri']))
    if name == 'cover':
        f = meta['scale'] * 0.75 * k
        go = [(fitz.Rect(g['x'] * f, y + g['y'] * f, (g['x'] + g['w']) * f, y + (g['y'] + g['h']) * f), g['to']) for g in meta['go']]
    y += bottom * k

for r, uri in links:
    page.insert_link({'kind': fitz.LINK_URI, 'from': r, 'uri': uri})
for r, to in go:
    page.insert_link({'kind': fitz.LINK_GOTO, 'from': r, 'page': 0, 'to': fitz.Point(0, starts[to]), 'zoom': 0})
page.set_rotation(0)
out.xref_set_key(page.xref, 'UserUnit', str(U))
out.set_metadata({'title': 'Rutujeet Nayak, Portfolio 2026', 'author': 'Rutujeet Nayak'})
out.save(OUT, garbage=4, deflate=True, deflate_images=True, deflate_fonts=True)
print({n: round(v * U) for n, v in starts.items()})
print(OUT, round(os.path.getsize(OUT) / 2**20, 2), 'MB', 'links', len(links), 'jumps', len(go), 'height', round(H * U))
