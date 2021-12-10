#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

PUZZLE_OF_DAY_DIR="${SERVER_ROOT}/games/puzzle-of-day"
mkdir -p "${PUZZLE_OF_DAY_DIR}"

cp -r "${SERVER_ROOT}/assets/templates/word-detective/js" "${PUZZLE_OF_DAY_DIR}"
