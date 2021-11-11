#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

# Create ef-5000 brick

"${SERVER_ROOT}/bin/export-brick" \
-i "${SERVER_ROOT}/assets/corpora/ef-5000.txt" \
"${SERVER_ROOT}/assets/corpora/ef-5000.brk"

# Init games

"${SCRIPT_DIR}/init-random-puzzle.sh"
"${SCRIPT_DIR}/init-week-puzzles.sh"
"${SCRIPT_DIR}/init-puzzle-of-day.sh"
"${SCRIPT_DIR}/init-puzzle-from-text.sh"
