#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="$( cd "${SCRIPT_PATH}" && cd ../../ && pwd)"

BOOK_TEXT_PATH="${1}"
OUTPUT_FOLDER="${2}"

mkdir -p "${OUTPUT_FOLDER}/assets"

BRICK_EXPORTER="${PROJECT_PATH}/build/app/export-brick/export-brick"
GAME_GEN_EXE="${PROJECT_PATH}/build/app/word-detective/word-detective"
RENDER_PY="${SCRIPT_PATH}/render-word-detective.py"


TEMPLATE_FOLDER="${PROJECT_PATH}/templates/word-detective"
BRICK_OUT_PATH="${OUTPUT_FOLDER}/assets/"$( basename "${BOOK_TEXT_PATH}")".brk"
JSON_PUZZLE_PATH="${OUTPUT_FOLDER}/assets/puzzle.json"

#Generate brick file
${BRICK_EXPORTER} "${BOOK_TEXT_PATH}" "${BRICK_OUT_PATH}"

#Generate json puzzle
${GAME_GEN_EXE} "${BRICK_OUT_PATH}" -mrandom -l7 -L7 -o"${JSON_PUZZLE_PATH}"

#Render puzzle html
python3 "${RENDER_PY}" "${TEMPLATE_FOLDER}" "${JSON_PUZZLE_PATH}" "${OUTPUT_FOLDER}"