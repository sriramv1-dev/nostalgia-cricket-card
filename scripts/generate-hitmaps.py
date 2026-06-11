from PIL import Image
import os

BASE = 'apps/web/public/images/card'

# Colour map — same across all shots
COLORS = {
    'cap':        (255, 0,   0,   255),  # red
    'capAccent':  (255, 136, 0,   255),  # orange
    'gloves':     (255, 255, 0,   255),  # yellow
    'pads':       (0,   255, 0,   255),  # green
    'shoes':      (0,   0,   255, 255),  # blue
    'bat':        (255, 0,   255, 255),  # magenta
    'ball':       (0,   255, 255, 255),  # cyan
    'wickets':    (255, 255, 255, 255),  # white
}

SHOTS = {
    'alpha-shot': [
        ('alpha-cap.png',        COLORS['cap']),
        ('alpha-cap-accent.png', COLORS['capAccent']),
        ('alpha-gloves.png',     COLORS['gloves']),
        ('alpha-pads.png',       COLORS['pads']),
        ('alpha-shoes.png',      COLORS['shoes']),
        ('alpha-bat.png',        COLORS['bat']),
    ],
    'loft-shot': [
        ('loft-cap.png',         COLORS['cap']),
        ('loft-cap-accent.png',  COLORS['capAccent']),
        ('loft-gloves.png',      COLORS['gloves']),
        ('loft-pads.png',        COLORS['pads']),
        ('loft-shoes.png',       COLORS['shoes']),
        ('loft-bat-body.png',    COLORS['bat']),
        ('loft-bat-outline.png', COLORS['bat']),
    ],
    'scoop-shot': [
        ('scoop-cap.png',        COLORS['cap']),
        ('scoop-cap-accent.png', COLORS['capAccent']),
        ('scoop-gloves.png',     COLORS['gloves']),
        ('scoop-pads.png',       COLORS['pads']),
        ('scoop-shoes.png',      COLORS['shoes']),
        ('scoop-bat.png',        COLORS['bat']),
        ('scoop-ball.png',       COLORS['ball']),
    ],
    'sweep-shot': [
        ('sweep-cap.png',        COLORS['cap']),
        ('sweep-cap-accent.png', COLORS['capAccent']),
        ('sweep-gloves.png',     COLORS['gloves']),
        ('sweep-pads.png',       COLORS['pads']),
        ('sweep-shoes.png',      COLORS['shoes']),
        ('sweep-bat.png',        COLORS['bat']),
    ],
    'uppercut-shot': [
        ('uppercut-cap.png',        COLORS['cap']),
        ('uppercut-cap-accent.png', COLORS['capAccent']),
        ('uppercut-gloves.png',     COLORS['gloves']),
        ('uppercut-pads.png',       COLORS['pads']),
        ('uppercut-shoes.png',      COLORS['shoes']),
        ('uppercut-bat.png',        COLORS['bat']),
    ],
    'pace-masks': [
        ('pace-cap.png',        COLORS['cap']),
        ('pace-cap-accent.png', COLORS['capAccent']),
        ('pace-shoes.png',      COLORS['shoes']),
        ('pace-ball.png',       COLORS['ball']),
    ],
    'spin-masks': [
        ('spin-cap.png',        COLORS['cap']),
        ('spin-cap-accent.png', COLORS['capAccent']),
        ('spin-shoes.png',      COLORS['shoes']),
        ('spin-ball.png',       COLORS['ball']),
    ],
    'keeping1': [
        ('keeping1-cap.png',        COLORS['cap']),
        ('keeping1-cap-accent.png', COLORS['capAccent']),
        ('keeping1-gloves.png',     COLORS['gloves']),
        ('keeping1-pads.png',       COLORS['pads']),
        ('keeping1-shoes.png',      COLORS['shoes']),
        ('keeping1-ball.png',       COLORS['ball']),
        ('keeping1-wickets.png',    COLORS['wickets']),
    ],
    'keeping2': [
        ('keeping2-cap.png',        COLORS['cap']),
        ('keeping2-cap-accent.png', COLORS['capAccent']),
        ('keeping2-gloves.png',     COLORS['gloves']),
        ('keeping2-pads.png',       COLORS['pads']),
        ('keeping2-shoes.png',      COLORS['shoes']),
        ('keeping2-wickets.png',    COLORS['wickets']),
    ],
}

for folder, layers in SHOTS.items():
    result = None
    folder_path = os.path.join(BASE, folder)

    for filename, color in layers:
        filepath = os.path.join(folder_path, filename)
        if not os.path.exists(filepath):
            print(f'MISSING: {filepath}')
            continue

        img = Image.open(filepath).convert('RGBA')

        if result is None:
            result = Image.new('RGBA', img.size, (0, 0, 0, 0))

        pixels = img.load()
        out = result.load()

        for y in range(img.height):
            for x in range(img.width):
                if pixels[x, y][3] > 10:
                    out[x, y] = color

    if result:
        out_path = os.path.join(folder_path, 'hitmap.png')
        result.save(out_path)
        print(f'✓ {folder}/hitmap.png  {result.size}')

print('Done.')
