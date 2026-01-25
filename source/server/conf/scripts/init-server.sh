#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

# Initialize word-source-manager

if [[ ! -f "/.config/word_source_manager/config.toml" ]]
then
  printf "/word-detective-server/word-sources-folder\n/word-detective-server/bin/export-brick\n" | word-source-manager list

  # Create en-5K brick

  word-source-manager "add" "en-5K" "english" "english-dictionary" "/word-detective-server/assets/corpora/en-5K.txt"

  # Create it-1K brick

  word-source-manager "add" "it-1K" "italian" "italian-dictionary" "/word-detective-server/assets/corpora/it-1K.txt"

  # Create fr-5K brick

  word-source-manager "add" "fr-5K" "french" "chatgpt-dictionary" "/word-detective-server/assets/corpora/fr-5K.txt"

  # Create pt-5K brick

  word-source-manager "add" "pt-5K" "portuguese" "chatgpt-dictionary" "/word-detective-server/assets/corpora/pt-5K.txt"

fi

# Init games

"${SCRIPT_DIR}/init-week-puzzles.sh"
"${SCRIPT_DIR}/init-puzzle-from-text.sh"

# Setup cron job to regenerate the puzzles every sunday

echo "00 6 * * 7 ${SCRIPT_DIR}/init-week-puzzles.sh" | crontab -
crond
node "${SERVER_ROOT}/init.js"

