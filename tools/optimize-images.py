#!/usr/bin/env python3
"""Optimise the 24 generated source PNGs into responsive WebP files + data/images.json manifest.
Sources live in assets/images/locksmith/newimages/ (kept untouched)."""
import json, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets/images/locksmith/newimages")
OUT = os.path.join(ROOT, "assets/img")
# index in sorted(os.listdir) -> (group, name, alt, sizes)
MAP = {
 0:  ("hero","emergency-car-locksmith","Locksmith technician in a black and orange uniform unlocking a car door at sunset beside a mobile service van",[800,1280,1672]),
 1:  ("services","car-key-programming","Automotive locksmith programming a car key fob with a diagnostic tablet",[480,800,1280]),
 2:  ("services","commercial-door-repair","Commercial locksmith repairing a glass storefront door handle",[480,800,1280]),
 3:  ("services","lock-replacement","Close-up of a locksmith replacing a door lock cylinder",[480,800,1280]),
 4:  ("services","residential-door-repair","Locksmith repairing a front door lock on a suburban home",[480,800,1280]),
 5:  ("about","locksmith-customer-service","Smiling locksmith shaking hands with a customer beside a black and orange service van",[480,800,1280]),
 6:  ("locations","massachusetts-illustrative","Illustrative sunset river skyline representing Massachusetts",[480,800,1280]),
 7:  ("locations","connecticut-illustrative","Illustrative sunset riverfront skyline representing Connecticut",[480,800,1280]),
 8:  ("emergency","emergency-cta-background","Dark charcoal and orange abstract background",[800,1280,1672]),
 9:  ("details","home-and-car-keys","House keys and a car key fob on a warm wooden table",[480,800,1280]),
 10: ("services","safe-locksmith","Locksmith opening a heavy-duty combination safe",[480,800,1280]),
 11: ("services","lock-rekeying","Locksmith working on a front door deadbolt",[480,800,1280]),
 12: ("emergency","mobile-emergency-locksmith","Locksmith technician with a toolbox walking from a service van toward a home at sunset",[480,800,1280,1672]),
 13: ("services","car-key-cutting","Mobile locksmith cutting a car key with a key machine inside a service van",[480,800,1280]),
 14: ("property-types","commercial-building","Modern glass commercial building entrance at golden hour",[480,800,1280]),
 15: ("about","locksmith-team-illustrative","Illustrative portrait of four locksmith technicians standing in front of a service van",[480,800,1280]),
 16: ("services","commercial-locksmith","Locksmith repairing a commercial storefront door",[480,800,1280]),
 17: ("services","lock-cylinder-rekey","Gloved hands fitting a key into a door lock cylinder",[480,800,1280]),
 18: ("property-types","luxury-vehicle","Black luxury SUV parked at sunset",[480,800,1280]),
 19: ("emergency","locksmith-service-van","Black and orange mobile locksmith service van parked on a residential street",[480,800,1280]),
 20: ("details","car-key-fob","Car key fob with lock, unlock and trunk buttons in warm studio light",[480,800,1280]),
 21: ("services","smart-lock-installation","Keypad smart lock installed on a wooden front door",[480,800,1280]),
 22: ("services","emergency-car-lockout","Locksmith technician opening a locked car door next to a service van",[480,800,1280]),
 23: ("property-types","residential-home","American suburban home at twilight with warm lighting",[480,800,1280]),
}
files = sorted(os.listdir(SRC))
manifest = {}
for i, (grp, name, alt, sizes) in MAP.items():
    im = Image.open(os.path.join(SRC, files[i])).convert("RGB")
    os.makedirs(os.path.join(OUT, grp), exist_ok=True)
    widths = []
    for w in sizes:
        w = min(w, im.width)
        h = round(im.height * w / im.width)
        p = os.path.join(OUT, grp, f"{name}-{w}.webp")
        (im if w == im.width else im.resize((w, h), Image.LANCZOS)).save(p, "WEBP", quality=74 if w > 1000 else 78, method=6)
        widths.append(w)
    manifest[name] = {"group": grp, "alt": alt, "widths": widths, "ratio": [im.width, im.height], "source": files[i]}
json.dump(manifest, open(os.path.join(ROOT, "data/images.json"), "w"), indent=1, ensure_ascii=False)
print(len(manifest), "images")
