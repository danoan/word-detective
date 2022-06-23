#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

# Create ef-5000 brick

"${SERVER_ROOT}/bin/export-brick" \
-i "${SERVER_ROOT}/assets/corpora/ef-5000.txt" \
"${SERVER_ROOT}/assets/corpora/en.brk"

# Create italian-1000 brick

"${SERVER_ROOT}/bin/export-brick" \
-l italian \
-i "${SERVER_ROOT}/assets/corpora/italian-1000.txt" \
"${SERVER_ROOT}/assets/corpora/it.brk"

# Init games

"${SCRIPT_DIR}/init-week-puzzles.sh"
"${SCRIPT_DIR}/init-puzzle-from-text.sh"

# Setup cron job to regenerate the puzzles every sunday

echo "00 6 * * 7 ${SCRIPT_DIR}/init-week-puzzles.sh" | crontab -
crond
node "${SERVER_ROOT}/init.js"
