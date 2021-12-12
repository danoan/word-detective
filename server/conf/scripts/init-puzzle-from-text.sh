#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

PUZZLE_FROM_TEXT_DIR="${SERVER_ROOT}/games/puzzle-from-text"
PUZZLE_FROM_TEXT_VIEWS_DIR="${SERVER_ROOT}/assets/views/games/puzzle-from-text"

mkdir -p "${PUZZLE_FROM_TEXT_DIR}"
mkdir -p "${PUZZLE_FROM_TEXT_VIEWS_DIR}"

cp -r "${PUZZLE_FROM_TEXT_DIR}/views/index-puzzle-from-text.ntl" "${PUZZLE_FROM_TEXT_VIEWS_DIR}/index.ntl"
