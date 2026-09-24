import zlib
import struct
import math
import os

def make_png(width, height, get_pixel):
    raw_rows = bytearray()
    for y in range(height):
        raw_rows.append(0)  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel(x, y, width, height)
            raw_rows.extend((r, g, b, a))

    compressed = zlib.compress(bytes(raw_rows), 9)

    def chunk(tag, data):
        c = tag + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack('>I', len(data)) + c + struct.pack('>I', crc)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')
    return png

def sunflower_pixel(x, y, w, h, maskable=False):
    # Normalized coordinates -1 to 1
    nx = (x - w / 2) / (w / 2)
    ny = (y - h / 2) / (h / 2)
    dist = math.sqrt(nx * nx + ny * ny)

    if maskable:
        # Full bleed amber/gold background
        bg_r, bg_g, bg_b = 254, 243, 199
    else:
        # Rounded squircle background
        # corner radius ~ 0.35
        ax, ay = abs(nx), abs(ny)
        sq_dist = (ax**4 + ay**4)**0.25
        if sq_dist > 0.95:
            return 0, 0, 0, 0  # Transparent outside squircle
        bg_r, bg_g, bg_b = 255, 251, 235

    # Safe zone for icon center
    icon_scale = 0.72 if maskable else 0.82
    ix = nx / icon_scale
    iy = ny / icon_scale
    idist = math.sqrt(ix * ix + iy * iy)
    angle = math.atan2(iy, ix)

    # Petals (12 petals)
    petal_var = math.cos(12 * angle)
    # Petals extend from idist 0.28 to 0.85
    if 0.26 <= idist <= (0.75 + 0.15 * petal_var):
        # Amber/yellow petal
        t = (idist - 0.26) / 0.6
        pr = int(251 - t * 30)
        pg = int(191 - t * 70)
        pb = int(36 - t * 30)
        return pr, pg, pb, 255

    # Sunflower center disc
    if idist < 0.28:
        # Warm brown seed center
        t = idist / 0.28
        cr = int(69 + t * 45)
        cg = int(26 + t * 25)
        cb = int(3 + t * 10)
        # concentric ring texture
        ring = int(math.sin(idist * 60) * 15)
        cr = max(0, min(255, cr + ring))
        cg = max(0, min(255, cg + ring))
        return cr, cg, cb, 255

    return bg_r, bg_g, bg_b, 255

os.makedirs('public', exist_ok=True)

# 192x192 standard
with open('public/pwa-192x192.png', 'wb') as f:
    f.write(make_png(192, 192, lambda x, y, w, h: sunflower_pixel(x, y, w, h, maskable=False)))

# 512x512 standard
with open('public/pwa-512x512.png', 'wb') as f:
    f.write(make_png(512, 512, lambda x, y, w, h: sunflower_pixel(x, y, w, h, maskable=False)))

# 512x512 maskable (safe zone 80%, full bleed background)
with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(make_png(512, 512, lambda x, y, w, h: sunflower_pixel(x, y, w, h, maskable=True)))

# apple-touch-icon.png (180x180)
with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(make_png(180, 180, lambda x, y, w, h: sunflower_pixel(x, y, w, h, maskable=False)))

print("Successfully generated all PWA PNG icons!")
