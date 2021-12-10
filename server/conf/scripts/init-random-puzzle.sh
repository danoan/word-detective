#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

RANDOM_PUZZLE_DIR="${SERVER_ROOT}/games/random-puzzle"
mkdir -p "${RANDOM_PUZZLE_DIR}"

cp -r "${SERVER_ROOT}/assets/templates/word-detective/js" "${RANDOM_PUZZLE_DIR}"
