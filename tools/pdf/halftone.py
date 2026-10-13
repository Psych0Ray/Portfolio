"""Blue halftone of the portrait: dots on a 45-degree screen, size by darkness, on the site's paper."""
import math
from PIL import Image, ImageOps, ImageEnhance, ImageDraw, ImageFilter

SRC = 'd:/Vibecode Portfolio/img/hobby/portrait.webp'
PAPER, BLUE = (237, 239, 246), (0, 47, 167)
OUT_W, OUT_H = 1520, 2000          # final pixels (the cover shows it at 760x1000)
CELL = 11
SS = 3                              # supersample for smooth dots

import numpy as np, cv2
g = np.asarray(Image.open(SRC).convert('L'))
g = g[110:900, 150:760]                      # head and shoulders
g = cv2.createCLAHE(clipLimit=2.6, tileGridSize=(6, 6)).apply(g)
# lift the shadows so the face reads, keep the darks deep
g = (255 * (g / 255.0) ** 0.8).astype(np.uint8)
# fade the busy background toward paper: a soft mask around the head and the torso
h, w = g.shape
mask = np.zeros((h, w), np.uint8)
cv2.ellipse(mask, (300, 225), (135, 165), 0, 0, 360, 255, -1)
cv2.ellipse(mask, (300, 620), (275, 330), 0, 0, 360, 255, -1)
mask = cv2.GaussianBlur(mask, (0, 0), 38).astype(np.float32) / 255
bg = cv2.GaussianBlur(g, (0, 0), 6).astype(np.float32)
bg = 255 - (255 - bg) * 0.28                 # light, few dots
g = (g * mask + bg * (1 - mask)).astype(np.uint8)
im = Image.fromarray(g).filter(ImageFilter.GaussianBlur(0.8))
# fit to the output
im = ImageOps.fit(im, (OUT_W, OUT_H), Image.LANCZOS, centering=(0.5, 0.3))

W, H = OUT_W * SS, OUT_H * SS
canvas = Image.new('RGB', (W, H), PAPER)
d = ImageDraw.Draw(canvas)
ang = math.radians(45)
ca, sa = math.cos(ang), math.sin(ang)
step = CELL
R = OUT_W + OUT_H
for i in range(-R // step, R // step + 1):
    for j in range(-R // step, R // step + 1):
        u, v = i * step, j * step
        x = u * ca - v * sa + OUT_W / 2
        y = u * sa + v * ca + OUT_H / 2
        if not (-step <= x < OUT_W + step and -step <= y < OUT_H + step):
            continue
        px = im.getpixel((min(OUT_W - 1, max(0, int(x))), min(OUT_H - 1, max(0, int(y)))))
        dark = 1 - px / 255
        if dark < 0.09:
            continue
        r = step * 0.62 * math.sqrt(dark)
        X, Y, rr = x * SS, y * SS, r * SS
        d.ellipse((X - rr, Y - rr, X + rr, Y + rr), fill=BLUE)
canvas = canvas.resize((OUT_W, OUT_H), Image.LANCZOS)
canvas.save('halftone.png')
print('ok', canvas.size)
