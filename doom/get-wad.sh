#!/bin/bash
# Downloads the shareware DOOM1.WAD (v1.9) next to this script and checks its md5.
cd "$(dirname "$0")" || exit 1
[ -f DOOM1.WAD ] && md5 -q DOOM1.WAD 2>/dev/null | grep -q f0cefca49926d00903cf57551d901abe && { echo "✓ DOOM1.WAD already here"; exit 0; }
curl -fsSL -o DOOM1.WAD https://raw.githubusercontent.com/Daivuk/PureDOOM/master/doom1.wad || { echo "✗ download failed"; exit 1; }
md5 -q DOOM1.WAD | grep -q f0cefca49926d00903cf57551d901abe && echo "✓ DOOM1.WAD (shareware v1.9)" || echo "⚠ DOOM1.WAD md5 differs"
