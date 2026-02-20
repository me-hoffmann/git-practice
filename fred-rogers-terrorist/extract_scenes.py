#!/usr/bin/env python3
"""
Extract World Builder scene bitmaps from Fred Rogers - Terrorist.dsk
and convert them to PNG files and base64-encoded data URLs for web use.

The disk image contains an HFS resource fork with ASCN (scene) resources.
Each scene resource contains PackBits-compressed 1-bit monochrome bitmap
strips that are assembled into complete scene images.
"""

import struct
import os
import sys
import base64
import io
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

# --- Configuration ---

DSK_PATH = "/Users/michaelhoffmann/Basilisk II/Fred Rogers - Terrorist.dsk"
RFORK_OFFSET = 0x3800  # Resource fork starts here on disk

# Scene name -> room ID mapping
SCENE_NAME_MAP = {
    "Introduction": "introduction",
    "Fred's House": "freds_house",
    "Front Porch": "front_porch",
    "Fish & Pic. Pic.": "fish_room",
    "Kitchen": "kitchen",
    "Alley": "scuzzy_alley",
    "backyard": "backyard",
    "Lair of the PBS Pres.": "pbs_lair",
    "neighbor's garden": "neighbors_garden",
    "bathroom": "bathroom",
    "Dimensional Warp": "dimensional_warp",
    "NMB": "make_believe_zone",
    "Sewer": "sewer",
    "Sewer2": "dark_area",
    "Cornflake's Factory": "cornflakes_factory",
    "Henrietta & Ex's place": "henrietta_place",
    "road": "quiet_street",
    "road2": "road_with_houses",
    "Chef Brockett's bakery": "chef_brocketts",
    "Lady Elaine's": "lady_elaines",
    "Platypus Mound": "platypus_mound",
    "Lady Aberlin's Crypt": "aberlins_crypt",
    "Daniel Tiger's Clock": "daniel_tigers_clock",
    "Tunnel": "hidden_tunnel",
    "Airport": "airport",
    "Airplane": "airplane",
    "Trolley station": "trolley_station",
    "Holding Tank": "holding_tank",
    "Sesame Street": "sesame_street",
    "First Class": "right_flight",
    "Chute Room": "chute_room",
    "Street": "side_street",
}


def unpackbits(data, expected_bytes):
    """
    Decompress Apple PackBits data.

    PackBits encoding:
    - n < 128: copy next (n+1) bytes literally
    - n > 128: repeat next byte (257-n) times
    - n == 128: no-op
    """
    result = bytearray()
    i = 0
    while i < len(data) and len(result) < expected_bytes:
        n = data[i]
        i += 1
        if n < 128:
            count = n + 1
            chunk = data[i:i + count]
            result.extend(chunk)
            i += count
        elif n > 128:
            count = 257 - n
            if i < len(data):
                result.extend([data[i]] * count)
                i += 1
        # n == 128: no-op, skip
    return bytes(result[:expected_bytes])


def parse_resource_fork(f):
    """
    Parse the HFS resource fork and return all ASCN resources.

    Returns list of dicts: {id, name, data}
    """
    # Read resource fork header
    f.seek(RFORK_OFFSET)
    header = f.read(16)
    data_off, map_off, data_len, map_len = struct.unpack('>IIII', header)

    data_abs = RFORK_OFFSET + data_off
    map_abs = RFORK_OFFSET + map_off

    # Read resource map header
    f.seek(map_abs + 24)  # Skip copy of header(16) + next_map(4) + file_ref(2) + attrs(2)
    type_list_off, name_list_off = struct.unpack('>HH', f.read(4))

    type_list_abs = map_abs + type_list_off
    name_list_abs = map_abs + name_list_off

    # Read type list
    f.seek(type_list_abs)
    num_types = struct.unpack('>h', f.read(2))[0] + 1

    ascn_resources = []

    for i in range(num_types):
        f.seek(type_list_abs + 2 + i * 8)
        rtype = f.read(4).decode('ascii', errors='replace')
        num_res = struct.unpack('>h', f.read(2))[0] + 1
        ref_list_off = struct.unpack('>H', f.read(2))[0]

        if rtype != 'ASCN':
            continue

        ref_list_abs = type_list_abs + ref_list_off

        for j in range(num_res):
            f.seek(ref_list_abs + j * 12)
            res_id = struct.unpack('>h', f.read(2))[0]
            name_off = struct.unpack('>H', f.read(2))[0]

            # 1 byte attrs + 3 bytes data offset
            b = f.read(4)
            res_data_off = (b[1] << 16) | (b[2] << 8) | b[3]

            # Get resource name
            name = ''
            if name_off != 0xFFFF:
                pos = f.tell()
                f.seek(name_list_abs + name_off)
                nlen = struct.unpack('B', f.read(1))[0]
                name = f.read(nlen).decode('ascii', errors='replace')
                f.seek(pos)

            # Read resource data
            abs_data_pos = data_abs + res_data_off
            pos = f.tell()
            f.seek(abs_data_pos)
            res_data_len = struct.unpack('>I', f.read(4))[0]
            res_data = f.read(res_data_len)
            f.seek(pos)

            ascn_resources.append({
                'id': res_id,
                'name': name,
                'data': res_data,
                'size': res_data_len,
            })

    return ascn_resources


def find_bitmap_sections(data):
    """
    Find all bitmap sub-sections within the bitmap data area of an ASCN resource.

    Each bitmap section starts with a 4-byte marker pattern:
      byte[0]: tag/flags (usually 0x00, can vary)
      byte[1]: 0x00
      byte[2]: flags (usually 0x00, can be 0x08)
      byte[3]: 0x18 (header indicator)

    Followed by:
      2 bytes: end offset (size of remaining section data from marker+4)
      8 bytes: QuickDraw bounding rectangle (top, left, bottom, right as big-endian int16)
      N bytes: PackBits-compressed pixel data
    """
    if len(data) < 4:
        return []

    # First 2 bytes indicate end of bitmap data section
    bitmap_end = struct.unpack('>H', data[:2])[0]
    if bitmap_end < 14:
        return []

    # Constrain to bitmap data area (starts at byte 2)
    bitmap_data = data[2:min(bitmap_end + 2, len(data))]

    sections = []
    i = 0
    while i < len(bitmap_data) - 13:
        # Match pattern: any byte[0], byte[1]==0x00, any byte[2], byte[3]==0x18
        if bitmap_data[i + 1] == 0x00 and bitmap_data[i + 3] == 0x18:
            if i + 14 > len(bitmap_data):
                i += 1
                continue
            end_off = struct.unpack('>H', bitmap_data[i + 4:i + 6])[0]
            top, left, bottom, right = struct.unpack('>hhhh', bitmap_data[i + 6:i + 14])
            w = right - left
            h = bottom - top

            # Validate: reasonable dimensions and end offset
            if (0 < w <= 640 and 0 < h <= 512 and end_off > 8 and
                    i + 4 + end_off <= len(bitmap_data) + 4):
                compressed_data = bitmap_data[i + 14:i + 4 + end_off]
                sections.append({
                    'offset': i,
                    'tag': bitmap_data[i],
                    'flags': bitmap_data[i + 2],
                    'end_off': end_off,
                    'top': top,
                    'left': left,
                    'bottom': bottom,
                    'right': right,
                    'width': w,
                    'height': h,
                    'compressed_data': compressed_data,
                })
                i = i + 4 + end_off
                continue
        i += 1

    return sections


def group_contiguous_strips(sections):
    """
    Group bitmap sections into sets of contiguous vertical strips that share
    the same left/right bounds.
    """
    if not sections:
        return []

    # Find all unique (left, right) combos
    lr_pairs = {}
    for s in sections:
        key = (s['left'], s['right'])
        if key not in lr_pairs:
            lr_pairs[key] = []
        lr_pairs[key].append(s)

    groups = []
    for (left, right), strips in lr_pairs.items():
        # Sort by top coordinate
        strips.sort(key=lambda s: s['top'])

        # Build contiguous groups
        current_group = [strips[0]]
        for s in strips[1:]:
            prev_bottom = current_group[-1]['bottom']
            gap = s['top'] - prev_bottom
            if -2 <= gap <= 2:  # Allow small overlap/gap
                current_group.append(s)
            else:
                if len(current_group) >= 2:
                    groups.append(current_group)
                current_group = [s]

        if len(current_group) >= 2:
            groups.append(current_group)
        elif len(current_group) == 1 and current_group[0]['height'] > 50:
            # Single large strip is also a valid group
            groups.append(current_group)

    return groups


def select_best_group(groups):
    """Select the group that covers the most area (the main scene background)."""
    if not groups:
        return None

    def group_area(g):
        total_h = max(s['bottom'] for s in g) - min(s['top'] for s in g)
        return g[0]['width'] * total_h

    return max(groups, key=group_area)


def decompress_strip(section):
    """
    Decompress a single bitmap strip.
    Returns (top, left, width, height, pixel_rows).
    """
    w = section['width']
    h = section['height']
    row_bytes = (w + 7) // 8
    expected = row_bytes * h

    decompressed = unpackbits(section['compressed_data'], expected)

    # Pad if we got less data than expected
    if len(decompressed) < expected:
        decompressed = decompressed + b'\xFF' * (expected - len(decompressed))

    rows = []
    for row in range(h):
        row_data = decompressed[row * row_bytes:(row + 1) * row_bytes]
        rows.append(row_data)

    return section['top'], section['left'], w, h, rows


def assemble_scene(strips_data):
    """
    Assemble all decompressed strips into a single scene image.

    Mac bitmap convention: 1 bit = black, 0 bit = white.
    Returns a PIL Image in L (grayscale) mode.
    """
    if not strips_data:
        return None

    all_tops = [s[0] for s in strips_data]
    all_lefts = [s[1] for s in strips_data]
    all_bottoms = [s[0] + s[3] for s in strips_data]
    all_rights = [s[1] + s[2] for s in strips_data]

    min_top = min(all_tops)
    min_left = min(all_lefts)
    max_bottom = max(all_bottoms)
    max_right = max(all_rights)

    img_w = max_right - min_left
    img_h = max_bottom - min_top

    # Create pixel buffer initialized to white (255)
    pixels = bytearray([255]) * (img_w * img_h)

    for top, left, w, h, rows in strips_data:
        x_offset = left - min_left
        y_offset = top - min_top

        for row_idx, row_data in enumerate(rows):
            y = y_offset + row_idx
            if y < 0 or y >= img_h:
                continue

            row_start = y * img_w

            for byte_idx, byte_val in enumerate(row_data):
                for bit in range(7, -1, -1):
                    x = x_offset + byte_idx * 8 + (7 - bit)
                    if 0 <= x < img_w:
                        # Mac bitmap: 1=black, 0=white
                        if (byte_val >> bit) & 1:
                            pixels[row_start + x] = 0  # black

    img = Image.frombytes('L', (img_w, img_h), bytes(pixels))
    return img


def main():
    script_dir = Path(__file__).parent
    scenes_dir = script_dir / "scenes"
    scenes_dir.mkdir(exist_ok=True)

    print(f"Opening disk image: {DSK_PATH}")

    with open(DSK_PATH, 'rb') as f:
        print("Parsing resource fork...")
        resources = parse_resource_fork(f)

    print(f"Found {len(resources)} ASCN resources")

    scene_images = {}  # room_id -> PIL Image

    for res in resources:
        name = res['name']
        data = res['data']
        res_id = res['id']

        print(f"\n--- Processing: \"{name}\" (ID={res_id}, size={res['size']}) ---")

        # Find bitmap sections
        sections = find_bitmap_sections(data)

        if not sections:
            print(f"  No bitmap sections found - skipping")
            continue

        print(f"  Found {len(sections)} bitmap sub-sections")

        # Group into contiguous strips
        groups = group_contiguous_strips(sections)

        if not groups:
            # For scenes with multiple independent bitmaps (like Holding Tank),
            # try compositing all sections together
            print(f"  No contiguous strip groups - compositing all sections")
            groups = [sections]

        # Select the best (largest) group for the main scene background
        best_group = select_best_group(groups)

        if not best_group:
            print(f"  Could not determine main scene group - skipping")
            continue

        print(f"  Using {len(best_group)} strips for main scene")

        # Decompress all strips in the best group
        strips_data = []
        for section in best_group:
            try:
                strip = decompress_strip(section)
                strips_data.append(strip)
                print(f"    Strip: ({section['top']},{section['left']})-"
                      f"({section['bottom']},{section['right']}) "
                      f"{section['width']}x{section['height']}")
            except Exception as e:
                print(f"    Error decompressing strip at offset {section['offset']}: {e}")

        if not strips_data:
            print(f"  No strips decompressed successfully - skipping")
            continue

        # Assemble into a complete image
        img = assemble_scene(strips_data)

        if img is None:
            print(f"  Failed to assemble scene image - skipping")
            continue

        print(f"  Assembled image: {img.size[0]}x{img.size[1]}")

        # Determine room ID
        room_id = None
        if name in SCENE_NAME_MAP:
            candidate_id = SCENE_NAME_MAP[name]
            if candidate_id not in scene_images:
                room_id = candidate_id
            else:
                # Handle duplicate: "road2" should also map to "side_street"
                if name == "road2" and "side_street" not in scene_images:
                    room_id = "side_street"
                elif name == "Street" and "side_street" not in scene_images:
                    room_id = "side_street"
                else:
                    room_id = f"{candidate_id}_{res_id}"
                    print(f"  WARNING: Duplicate scene name \"{name}\", "
                          f"using room_id \"{room_id}\"")
        else:
            room_id = name.lower().replace(" ", "_").replace("'", "").replace("&", "and")
            print(f"  WARNING: Unmapped scene name \"{name}\", using room_id \"{room_id}\"")

        if room_id is None:
            print(f"  Skipping duplicate")
            continue

        # Save PNG
        png_path = scenes_dir / f"{room_id}.png"
        img.save(str(png_path), "PNG")
        print(f"  Saved: {png_path}")

        scene_images[room_id] = img

    # Generate JavaScript file with base64-encoded PNGs
    print(f"\n{'='*60}")
    print(f"Generating scene_data.js...")

    js_lines = [
        "// Auto-generated scene bitmap data",
        "// Extracted from Fred Rogers - Terrorist.dsk resource fork",
        "// Each scene is a base64-encoded PNG data URL",
        "",
        "const SCENE_BITMAPS = {",
    ]

    for room_id in sorted(scene_images.keys()):
        img = scene_images[room_id]

        # Convert to PNG bytes
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        png_bytes = buf.getvalue()

        # Encode as base64 data URL
        b64 = base64.b64encode(png_bytes).decode('ascii')
        data_url = f"data:image/png;base64,{b64}"

        js_lines.append(f'  "{room_id}": "{data_url}",')

    js_lines.append("};")
    js_lines.append("")
    js_lines.append("// Export for use in game engine")
    js_lines.append("if (typeof module !== 'undefined' && module.exports) {")
    js_lines.append("  module.exports = SCENE_BITMAPS;")
    js_lines.append("}")
    js_lines.append("")

    js_path = script_dir / "scene_data.js"
    with open(js_path, 'w') as jf:
        jf.write('\n'.join(js_lines))

    print(f"Generated: {js_path}")
    print(f"\nTotal scenes extracted: {len(scene_images)}")
    print(f"Scenes: {', '.join(sorted(scene_images.keys()))}")

    # Report scenes that had no bitmaps
    all_room_ids = set(SCENE_NAME_MAP.values())
    missing = all_room_ids - set(scene_images.keys())
    if missing:
        print(f"\nScenes with no bitmap data: {', '.join(sorted(missing))}")


if __name__ == '__main__':
    main()
