#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

PUZZLE_FROM_TEXT_DIR="${SERVER_ROOT}/games/puzzle-from-text"
mkdir -p "${PUZZLE_FROM_TEXT_DIR}"

cp -r "${SERVER_ROOT}/assets/templates/word-detective/assets" "${PUZZLE_FROM_TEXT_DIR}/assets"
cp -r "${SERVER_ROOT}/assets/templates/word-detective/css" "${PUZZLE_FROM_TEXT_DIR}/css"
cp -r "${SERVER_ROOT}/assets/templates/word-detective/js" "${PUZZLE_FROM_TEXT_DIR}/js"
cp -r "${SERVER_ROOT}/assets/templates/word-detective/index-puzzle-from-text.ntl" "${PUZZLE_FROM_TEXT_DIR}/index.ntl"
