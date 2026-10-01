import zlib
import struct
import os
import math

def generate_crest_png(width, height, is_banner=False):
    cx, cy = width / 2, height / 2
    r_outer = min(width, height) * 0.47
    r_mid = min(width, height) * 0.44
    r_inner = min(width, height) * 0.41
    
    rows = []
    for y in range(height):
        row = bytearray([0]) # PNG filter 0
        for x in range(width):
            dx = x - cx
            dy = y - cy
            dist = math.hypot(dx, dy)
            
            if is_banner:
                # Banner has deep navy background
                base_r, base_g, base_b = 23, 24, 82
                if dist > r_outer + 12:
                    row.extend([base_r, base_g, base_b, 255])
                    continue

            if dist > r_outer:
                if is_banner:
                    row.extend([23, 24, 82, 255])
                else:
                    # Transparent outside circular crest
                    row.extend([0, 0, 0, 0])
            elif dist > r_outer - max(2, width * 0.02):
                # Outer gold rim
                row.extend([255, 240, 0, 255])
            elif dist > r_mid:
                # Royal blue ring
                row.extend([32, 33, 107, 255])
            elif dist > r_mid - max(1, width * 0.01):
                # Inner gold ring
                row.extend([245, 217, 0, 255])
            elif dist > r_inner:
                # Accent ring
                row.extend([41, 42, 134, 255])
            else:
                # Inner disk: Royal Deep Navy (#171852)
                # Check for Crescent & Star, Book shapes
                norm_x = (x - cx) / r_inner
                norm_y = (y - cy) / r_inner
                
                # Crescent in upper section (-0.5 to -0.1)
                moon_c1 = math.hypot(norm_x - 0.0, norm_y - (-0.32))
                moon_c2 = math.hypot(norm_x - 0.08, norm_y - (-0.35))
                is_crescent = (moon_c1 < 0.28 and moon_c2 > 0.22)
                
                # Star near crescent
                star_dist = math.hypot(norm_x - 0.16, norm_y - (-0.42))
                is_star = star_dist < 0.07
                
                # Open book in center (norm_y between 0.0 and 0.45, |norm_x| < 0.55)
                is_book = False
                if 0.05 < norm_y < 0.48 and abs(norm_x) < 0.52:
                    # Page shape
                    page_curve = 0.08 * math.sin(abs(norm_x) * math.pi)
                    if (norm_y - page_curve) > 0.12 and (norm_y - page_curve) < 0.42:
                        is_book = True
                        
                # Spine line
                is_spine = (abs(norm_x) < 0.02 and 0.10 < norm_y < 0.45)
                
                # Laurel wreath sides
                is_laurel = False
                if 0.1 < norm_y < 0.65:
                    laurel_r = math.hypot(abs(norm_x) - 0.55, norm_y - 0.35)
                    if 0.18 < laurel_r < 0.24:
                        is_laurel = True

                if is_crescent:
                    row.extend([255, 255, 255, 255]) # Pure White crescent
                elif is_star:
                    row.extend([255, 240, 0, 255]) # Golden Star
                elif is_spine:
                    row.extend([23, 24, 82, 255]) # Navy spine
                elif is_book:
                    row.extend([250, 250, 252, 255]) # White Book
                elif is_laurel:
                    row.extend([245, 217, 0, 255]) # Golden Laurel
                else:
                    # Gradient deep navy fill
                    shade = int(23 + 12 * (1 - dist / r_inner))
                    row.extend([shade, shade + 2, 82, 255])
                    
        rows.append(bytes(row))
        
    raw_data = b''.join(rows)
    compressed = zlib.compress(raw_data, 9)
    
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        
    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    idat = chunk(b'IDAT', compressed)
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend

def create_ico(png_data):
    # Standard ICO wrapper containing one PNG image
    # ICONDIR header: 6 bytes
    # ICONDIRENTRY: 16 bytes
    # Image data: len(png_data)
    num_images = 1
    icondir = struct.pack('<HHH', 0, 1, num_images)
    w = 64
    h = 64
    b_color_count = 0
    b_reserved = 0
    w_planes = 1
    w_bit_count = 32
    dw_bytes_in_res = len(png_data)
    dw_image_offset = 6 + 16
    direntry = struct.pack('<BBBBHHII', w, h, b_color_count, b_reserved, w_planes, w_bit_count, dw_bytes_in_res, dw_image_offset)
    return icondir + direntry + png_data

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    targets = [
        (os.path.join(base_dir, 'public/branding/logo.png'), 512, 512, False),
        (os.path.join(base_dir, 'src/assets/branding/logo.png'), 512, 512, False),
        (os.path.join(base_dir, 'public/icon-512.png'), 512, 512, False),
        (os.path.join(base_dir, 'public/icon-192.png'), 192, 192, False),
        (os.path.join(base_dir, 'public/apple-touch-icon.png'), 180, 180, False),
        (os.path.join(base_dir, 'public/favicon.png'), 64, 64, False),
        (os.path.join(base_dir, 'public/og-image.png'), 1200, 630, True),
    ]
    
    for path, w, h, is_banner in targets:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        data = generate_crest_png(w, h, is_banner)
        with open(path, 'wb') as f:
            f.write(data)
        print(f"Generated {path} ({w}x{h}, {len(data)} bytes)")

    # Favicon.ico
    fav_png = generate_crest_png(64, 64, False)
    ico_data = create_ico(fav_png)
    ico_path = os.path.join(base_dir, 'public/favicon.ico')
    with open(ico_path, 'wb') as f:
        f.write(ico_data)
    print(f"Generated {ico_path}")

if __name__ == '__main__':
    main()
