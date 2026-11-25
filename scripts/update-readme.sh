#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
README_FILE="$ROOT_DIR/README.md"

python3 - "$ROOT_DIR" "$README_FILE" << 'PY'
import os
import re
import sys

root_dir, readme_path = sys.argv[1], sys.argv[2]

KNOWN_DESCRIPTIONS = {
    "1-Seek": "Comportement de base **Seek** & **Flee** vers une cible",
    "2-PursueEvade": "Comportements **Pursuit** & **Evasion** avec cible mobile",
    "2-PursueEvade_correction": "Correction de **Pursuit** & **Evasion**",
    "3-Arrival": "Comportement **Arrival** avec zone de freinage",
    "3-Arrival_correction": "Correction **Arrival** + démonstrations `Snake` / `SnakeWander`",
    "4-Wander": "Comportement **Wander** avec traînée et sprite",
}

entries = []
for name in sorted(os.listdir(root_dir)):
    full = os.path.join(root_dir, name)
    if not os.path.isdir(full) or name.startswith(".") or name in ("scripts", "article_craig_reynolds"):
        continue
    if os.path.isfile(os.path.join(full, "sketch.js")) or os.path.isfile(os.path.join(full, "index.html")):
        js_files = sorted(
            f for f in os.listdir(full)
            if f.endswith(".js") and os.path.isfile(os.path.join(full, f))
        )
        desc = KNOWN_DESCRIPTIONS.get(name, f"Sketch p5.js `{name}`")
        files_str = ", ".join(f"`{f}`" for f in js_files) if js_files else "—"
        entries.append(f"| `{name}/` | {desc} | {files_str} |")

table = "\n".join([
    "| Dossier | Description | Fichiers principaux |",
    "| --- | --- | --- |",
    *entries,
])

with open(readme_path, "r", encoding="utf-8") as f:
    content = f.read()

pattern = r"(<!-- AUTO-GENERATED:SKETCHES:START -->\n).*?(\n<!-- AUTO-GENERATED:SKETCHES:END -->)"
updated, count = re.subn(pattern, lambda m: m.group(1) + table + m.group(2), content, flags=re.DOTALL)

if count == 0:
    print("Marqueurs AUTO-GENERATED:SKETCHES introuvables dans README.md", file=sys.stderr)
    sys.exit(1)

with open(readme_path, "w", encoding="utf-8") as f:
    f.write(updated)

print(f"README.md mis à jour ({len(entries)} sketches recensés).")
PY
