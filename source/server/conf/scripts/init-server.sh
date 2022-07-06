#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

# Initialize dictionary-manager

if [[ ! -f "/.config/dictionary_manager/config.toml" ]]
then
  printf "/word-detective-server/dictionaries-folder\n/word-detective-server/bin/export-brick\n" | dictionary-manager list

  # Create en-5K brick

  dictionary-manager "add" "en-5K" "english" "english-dictionary" "/word-detective-server/assets/corpora/en-5K.txt"

  # Create it-1K brick

  dictionary-manager "add" "it-1K" "italian" "italian-dictionary" "/word-detective-server/assets/corpora/it-1K.txt"

fi

# Init games

"${SCRIPT_DIR}/init-week-puzzles.sh"
"${SCRIPT_DIR}/init-puzzle-from-text.sh"

# Setup cron job to regenerate the puzzles every sunday

echo "00 6 * * 7 ${SCRIPT_DIR}/init-week-puzzles.sh" | crontab -
crond
node "${SERVER_ROOT}/init.js"

