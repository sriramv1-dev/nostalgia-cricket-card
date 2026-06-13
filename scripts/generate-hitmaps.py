"""
Generate hit-map PNGs and centroid JSON files for all shot types.

Hit-maps: flat-colour composites where each accessory region is painted with
its canonical colour (cap=red, shoes=blue, etc.).  Used by the tap-mode
customize page to identify which accessory was clicked.

Centroid JSON: for each shot type, records the centroid (average x,y) of
every accessory colour region, normalised to [0,1] relative to the hitmap
image dimensions.  Used by CharacterCustomizerDiagram to anchor connector
lines.
"""

from __future__ import annotations

from PIL import Image
import os
import json
from typing import Optional

BASE = 'apps/web/public/images/card'
CENTROIDS_OUT = 'apps/web/public/data/centroids'

COLORS = {
    'cap':        (255, 0,   0,   255),
    'capAccent':  (255, 136, 0,   255),
    'gloves':     (255, 255, 0,   255),
    'pads':       (0,   255, 0,   255),
    'shoes':      (0,   0,   255, 255),
    'bat':        (255, 0,   255, 255),
    'ball':       (0,   255, 255, 255),
    'wickets':    (255, 255, 255, 255),
}

# RGB → accessor key (for centroid computation from hitmap)
RGB_TO_KEY: dict[tuple[int, int, int], str] = {v[:3]: k for k, v in COLORS.items()}

SHOTS: dict[str, dict] = {
    'alpha-shot': {
        'shotType': 'alpha',
        'layers': [
            ('alpha-cap.png',        COLORS['cap']),
            ('alpha-cap-accent.png', COLORS['capAccent']),
            ('alpha-gloves.png',     COLORS['gloves']),
            ('alpha-pads.png',       COLORS['pads']),
            ('alpha-shoes.png',      COLORS['shoes']),
            ('alpha-bat.png',        COLORS['bat']),
        ],
    },
    'loft-shot': {
        'shotType': 'loft',
        'layers': [
            ('loft-cap.png',         COLORS['cap']),
            ('loft-cap-accent.png',  COLORS['capAccent']),
            ('loft-gloves.png',      COLORS['gloves']),
            ('loft-pads.png',        COLORS['pads']),
            ('loft-shoes.png',       COLORS['shoes']),
            ('loft-bat-body.png',    COLORS['bat']),
            ('loft-bat-outline.png', COLORS['bat']),
        ],
    },
    'scoop-shot': {
        'shotType': 'scoop',
        'layers': [
            ('scoop-cap.png',        COLORS['cap']),
            ('scoop-cap-accent.png', COLORS['capAccent']),
            ('scoop-gloves.png',     COLORS['gloves']),
            ('scoop-pads.png',       COLORS['pads']),
            ('scoop-shoes.png',      COLORS['shoes']),
            ('scoop-bat.png',        COLORS['bat']),
            ('scoop-ball.png',       COLORS['ball']),
        ],
    },
    'sweep-shot': {
        'shotType': 'sweep',
        'layers': [
            ('sweep-cap.png',        COLORS['cap']),
            ('sweep-cap-accent.png', COLORS['capAccent']),
            ('sweep-gloves.png',     COLORS['gloves']),
            ('sweep-pads.png',       COLORS['pads']),
            ('sweep-shoes.png',      COLORS['shoes']),
            ('sweep-bat.png',        COLORS['bat']),
        ],
    },
    'uppercut-shot': {
        'shotType': 'uppercut',
        'layers': [
            ('uppercut-cap.png',        COLORS['cap']),
            ('uppercut-cap-accent.png', COLORS['capAccent']),
            ('uppercut-gloves.png',     COLORS['gloves']),
            ('uppercut-pads.png',       COLORS['pads']),
            ('uppercut-shoes.png',      COLORS['shoes']),
            ('uppercut-bat.png',        COLORS['bat']),
        ],
    },
    'pace-masks': {
        'shotType': 'pace',
        'layers': [
            ('pace-cap.png',        COLORS['cap']),
            ('pace-cap-accent.png', COLORS['capAccent']),
            ('pace-shoes.png',      COLORS['shoes']),
            ('pace-ball.png',       COLORS['ball']),
        ],
    },
    'spin-masks': {
        'shotType': 'spin',
        'layers': [
            ('spin-cap.png',        COLORS['cap']),
            ('spin-cap-accent.png', COLORS['capAccent']),
            ('spin-shoes.png',      COLORS['shoes']),
            ('spin-ball.png',       COLORS['ball']),
        ],
    },
    'keeping1': {
        'shotType': 'keeping1',
        'layers': [
            ('keeping1-cap.png',        COLORS['cap']),
            ('keeping1-cap-accent.png', COLORS['capAccent']),
            ('keeping1-gloves.png',     COLORS['gloves']),
            ('keeping1-pads.png',       COLORS['pads']),
            ('keeping1-shoes.png',      COLORS['shoes']),
            ('keeping1-ball.png',       COLORS['ball']),
            ('keeping1-wickets.png',    COLORS['wickets']),
        ],
    },
    'keeping2': {
        'shotType': 'keeping2',
        'layers': [
            ('keeping2-cap.png',        COLORS['cap']),
            ('keeping2-cap-accent.png', COLORS['capAccent']),
            ('keeping2-gloves.png',     COLORS['gloves']),
            ('keeping2-pads.png',       COLORS['pads']),
            ('keeping2-shoes.png',      COLORS['shoes']),
            ('keeping2-wickets.png',    COLORS['wickets']),
        ],
    },
}


def compute_centroids(hitmap: Image.Image) -> dict[str, dict[str, float]]:
    """
    Scan the hitmap once, accumulating x/y sums per accessory colour.
    Returns normalised centroids {key: {x, y}} where x,y ∈ [0, 1].
    """
    width, height = hitmap.size
    pixels = hitmap.load()

    sums: dict[str, list[int]] = {k: [0, 0, 0] for k in COLORS}  # sx, sy, count

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a <= 10:
                continue
            key = RGB_TO_KEY.get((r, g, b))
            if key:
                sums[key][0] += x
                sums[key][1] += y
                sums[key][2] += 1

    centroids: dict[str, dict[str, float]] = {}
    for key, (sx, sy, count) in sums.items():
        if count > 0:
            centroids[key] = {
                'x': round(sx / count / width, 4),
                'y': round(sy / count / height, 4),
            }
    return centroids


os.makedirs(CENTROIDS_OUT, exist_ok=True)

for folder, shot_data in SHOTS.items():
    shot_type: str = shot_data['shotType']
    layers: list[tuple[str, tuple[int, int, int, int]]] = shot_data['layers']

    result: Optional[Image.Image] = None
    folder_path = os.path.join(BASE, folder)

    for filename, color in layers:
        filepath = os.path.join(folder_path, filename)
        if not os.path.exists(filepath):
            print(f'  MISSING: {filepath}')
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

    if result is None:
        print(f'  SKIP (no layers found): {folder}')
        continue

    # Save hitmap
    out_path = os.path.join(folder_path, 'hitmap.png')
    result.save(out_path)
    print(f'✓ {folder}/hitmap.png  {result.size}')

    # Compute and save centroids
    centroids = compute_centroids(result)
    centroid_payload = {
        'imageWidth': result.width,
        'imageHeight': result.height,
        'centroids': centroids,
    }
    json_path = os.path.join(CENTROIDS_OUT, f'{shot_type}.json')
    with open(json_path, 'w') as f:
        json.dump(centroid_payload, f, indent=2)
    print(f'  → centroids/{shot_type}.json  ({len(centroids)} keys)')

print('\nDone.')
