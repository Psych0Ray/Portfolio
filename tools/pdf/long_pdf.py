"""One long scrolling PDF: the cover and every captured page stacked on a single PDF page.

Run from the folder holding cover.jpg, pages.json and pages/ (made by tools/pdf_capture.js and
tools/pdf/cover.js). PDF viewers cap a page at 14400 units, so the page is drawn at 1/8 scale and
UserUnit 8 restores its real size (1440pt wide)."""
import json, os, pymupdf as fitz
from PIL import Image

files = ['cover.jpg'] + [p['file'] for p in json.load(open('pages.json'))]
sizes = [Image.open(f).size for f in files]          # 2x pixels
U = 8
W = 1440 / U
H = sum(h for w, h in sizes) / 2 / U
assert H <= 14400, H
doc = fitz.open()
page = doc.new_page(width=W, height=H)
y = 0
for f, (w, h) in zip(files, sizes):
    hh = h / 2 / U
    page.insert_image(fitz.Rect(0, y, W, y + hh), filename=f)
    y += hh
doc.xref_set_key(page.xref, 'UserUnit', str(U))
out = os.path.expanduser('~/Downloads/Rutujeet Nayak Portfolio 2026.pdf')
doc.save(out, garbage=3, deflate=True)
print(out)
