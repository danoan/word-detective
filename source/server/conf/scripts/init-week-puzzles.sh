#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

WEEK_PUZZLES_DIR="${SERVER_ROOT}/games/week-puzzles"
mkdir -p "${WEEK_PUZZLES_DIR}"

"${SERVER_ROOT}/bin/generate-week-games.sh"
