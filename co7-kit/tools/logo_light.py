"""Make the light-theme CO7 logo: remove the black background, 'CO' -> ink, '7' + brackets -> brand red.
Usage: python3 logo_light.py <logo_on_black.png> <out.png>"""
import sys
import numpy as np
from PIL import Image
im = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(float)
bg = np.median(im[:40, :40].reshape(-1, 3), axis=0)
red = im[(im[:, :, 0] - im[:, :, 1]) > 120]; wht = im[im.min(axis=2) > 200]
alpha = np.clip((im.max(axis=2) - bg.max()) / (np.median(wht.max(axis=1)) - bg.max()), 0, 1)
redness = np.clip((im[:, :, 0] - im[:, :, 1]) / np.median(red[:, 0] - red[:, 1]), 0, 1)
ink, brand = np.array([0x1B, 0x2A, 0x3A], float), np.array([0xD0, 0x11, 0x1B], float)
col = ink * (1 - redness[..., None]) + brand * redness[..., None]
a = np.where(redness > 0.05, np.clip((im[:, :, 0] - bg[0]) / (np.median(red[:, 0]) - bg[0]), 0, 1), alpha)
a = np.clip((a - 0.06) / 0.94, 0, 1)
img = Image.fromarray(np.dstack([col, a * 255]).astype(np.uint8), 'RGBA')
img.crop(img.getbbox()).save(sys.argv[2])
