#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

PUZZLE_OF_DAY_DIR="${SERVER_ROOT}/games/puzzle-of-day"
mkdir -p "${PUZZLE_OF_DAY_DIR}"

cp -r "${SERVER_ROOT}/assets/templates/word-detective/assets" "${PUZZLE_OF_DAY_DIR}/assets"
cp -r "${SERVER_ROOT}/assets/templates/word-detective/css" "${PUZZLE_OF_DAY_DIR}/css"
cp -r "${SERVER_ROOT}/assets/templates/word-detective/js" "${PUZZLE_OF_DAY_DIR}/js"
cp -r "${SERVER_ROOT}/assets/templates/word-detective/index-puzzle-of-day.html" "${PUZZLE_OF_DAY_DIR}/index.html"
