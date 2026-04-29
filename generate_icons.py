from PIL import Image, ImageDraw, ImageFilter
import math

def create_fitness_icon(size=512):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    s = size / 512  # scale factor

    # --- ARKA PLAN ---
    draw.rounded_rectangle([0, 0, size - 1, size - 1],
                           radius=int(size * 0.22),
                           fill=(6, 16, 6, 255))

    # Renk paleti
    g_bright  = (30,  235, 90)
    g_mid     = (20,  185, 65)
    g_dark    = (10,  120, 38)
    g_darker  = (8,   75,  24)
    g_subtle  = (12,  55,  22)   # arka plan barlar
    g_subtler = (10,  38,  16)

    cx = size // 2

    # ===================================================
    # 1) ARKA PLAN — Fintrack tarzı yükselen barlar
    # ===================================================
    bar_heights = [0.28, 0.38, 0.50, 0.64]   # maksimum yüksekliğin oranı
    bw  = int(52 * s)
    gap = int(22 * s)
    total_w = len(bar_heights) * bw + (len(bar_heights) - 1) * gap
    bx0 = cx - total_w // 2 + int(18 * s)
    base_y = int(490 * s)
    max_bar_h = int(310 * s)

    for i, ratio in enumerate(bar_heights):
        bh = int(max_bar_h * ratio)
        bx = bx0 + i * (bw + gap)
        by = base_y - bh
        # Çift katman: daha koyu dış, daha parlak iç
        draw.rounded_rectangle([bx, by, bx + bw, base_y],
                               radius=int(10 * s), fill=g_subtle)
        inner_pad = int(6 * s)
        draw.rounded_rectangle([bx + inner_pad, by + inner_pad,
                                bx + bw - inner_pad, base_y - inner_pad],
                               radius=int(7 * s), fill=g_subtler)

    # Trend çizgisi (Fintrack'taki ok gibi) — barların tepesinden yukarı
    trend_pts = []
    for i, ratio in enumerate(bar_heights):
        bh = int(max_bar_h * ratio)
        bx = bx0 + i * (bw + gap)
        trend_pts.append((bx + bw // 2, base_y - bh - int(12 * s)))
    # Son noktadan yukarı çıkan ok
    last_x, last_y = trend_pts[-1]
    trend_pts.append((last_x + int(30 * s), last_y - int(55 * s)))

    for i in range(len(trend_pts) - 1):
        draw.line([trend_pts[i], trend_pts[i + 1]],
                  fill=g_mid, width=int(7 * s))

    # Ok ucu
    ax, ay = trend_pts[-1]
    arrow_size = int(18 * s)
    draw.polygon([
        (ax, ay),
        (ax - arrow_size, ay + arrow_size),
        (ax + int(5*s), ay + arrow_size - int(10*s))
    ], fill=g_bright)

    # ===================================================
    # 2) KİŞİ SİLÜETİ — halter overhead press
    # ===================================================
    pcx  = cx - int(10 * s)       # kişi merkezi (hafif sol)
    bar_y = int(110 * s)           # halter yüksekliği

    # -- Baş --
    hr = int(36 * s)
    head_cy = int(175 * s)
    draw.ellipse([pcx - hr, head_cy - hr, pcx + hr, head_cy + hr],
                 fill=g_bright)

    # -- Gövde --
    tw = int(58 * s)
    torso_top = head_cy + hr + int(6 * s)
    torso_bot = torso_top + int(100 * s)
    draw.rounded_rectangle([pcx - tw // 2, torso_top,
                            pcx + tw // 2, torso_bot],
                           radius=int(12 * s), fill=g_mid)

    # -- Bacaklar --
    lw = int(24 * s)
    lh = int(115 * s)
    lg = int(7 * s)
    lr = int(9 * s)
    draw.rounded_rectangle([pcx - lg - lw, torso_bot - int(8 * s),
                            pcx - lg,      torso_bot + lh],
                           radius=lr, fill=g_dark)
    draw.rounded_rectangle([pcx + lg,      torso_bot - int(8 * s),
                            pcx + lg + lw, torso_bot + lh],
                           radius=lr, fill=g_dark)

    # -- Kollar (omuzdan haltere) --
    sw = int(35 * s)       # omuz genişliği (merkeze uzaklık)
    sy = torso_top + int(18 * s)   # omuz y
    arm_end_x = int(115 * s)      # halterin tutulduğu noktanın cx'e uzaklığı
    arm_thick = int(19 * s)

    draw.line([(pcx - sw, sy), (pcx - arm_end_x, bar_y + int(14 * s))],
              fill=g_mid, width=arm_thick)
    draw.line([(pcx + sw, sy), (pcx + arm_end_x, bar_y + int(14 * s))],
              fill=g_mid, width=arm_thick)

    # ===================================================
    # 3) HALTER (overhead)
    # ===================================================
    bbar_half = int(128 * s)
    bbar_h    = int(14 * s)
    bbar_r    = bbar_h // 2

    # Bar
    draw.rounded_rectangle([pcx - bbar_half, bar_y - bbar_h // 2,
                            pcx + bbar_half, bar_y + bbar_h // 2],
                           radius=bbar_r, fill=g_mid)
    # Grip vurgusu
    grip_w = int(38 * s)
    draw.rounded_rectangle([pcx - grip_w, bar_y - bbar_h // 2,
                            pcx + grip_w, bar_y + bbar_h // 2],
                           radius=bbar_r, fill=g_bright)

    # Plakalar
    def plate(offset_x, side):
        po_w = int(17 * s); po_h = int(68 * s); po_r = int(5 * s)
        pi_w = int(12 * s); pi_h = int(48 * s); pg   = int(5 * s)
        x0 = pcx + side * offset_x
        # Büyük dış
        if side == 1:
            draw.rounded_rectangle([x0, bar_y - po_h//2, x0 + po_w, bar_y + po_h//2],
                                   radius=po_r, fill=g_darker)
            draw.rounded_rectangle([x0 + po_w + pg, bar_y - pi_h//2,
                                    x0 + po_w + pg + pi_w, bar_y + pi_h//2],
                                   radius=po_r, fill=g_dark)
        else:
            draw.rounded_rectangle([x0 - po_w, bar_y - po_h//2, x0, bar_y + po_h//2],
                                   radius=po_r, fill=g_darker)
            draw.rounded_rectangle([x0 - po_w - pg - pi_w, bar_y - pi_h//2,
                                    x0 - po_w - pg, bar_y + pi_h//2],
                                   radius=po_r, fill=g_dark)

    plate(bbar_half,  1)
    plate(bbar_half, -1)

    # ===================================================
    # 4) GLOW
    # ===================================================
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gr = int(size * 0.22)
    gd.ellipse([pcx - gr, size//2 - gr, pcx + gr, size//2 + gr],
               fill=(0, 210, 65, 28))
    glow = glow.filter(ImageFilter.GaussianBlur(int(size * 0.08)))
    img = Image.alpha_composite(img, glow)

    return img

icon_512 = create_fitness_icon(512)
icon_512.save('icons/icon-512.png')
icon_512.resize((192, 192), Image.LANCZOS).save('icons/icon-192.png')
print("Done!")
