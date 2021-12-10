#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="$( cd "${SCRIPT_PATH}" && cd .. && pwd)"

BIN_PATH="${PROJECT_PATH}/bin"
ASSETS_PATH="${PROJECT_PATH}/assets"

PUZZLE_GEN_EXE="${BIN_PATH}/word-detective"
RENDER_PUZZLE="${BIN_PATH}/render-word-detective.py"

OUTPUT_FOLDER="${PROJECT_PATH}/games/week-puzzles"

DAYS="sunday monday tuesday wednesday thursday friday saturday"
for day in $DAYS
do
  CUR_OUT_FOLDER="${OUTPUT_FOLDER}/${day}"
  rm -rf "${CUR_OUT_FOLDER}"

  mkdir -p "${CUR_OUT_FOLDER}/assets"
  JSON_PUZZLE_PATH="${CUR_OUT_FOLDER}/assets/puzzle.json"

  #Generate json puzzle
  ${PUZZLE_GEN_EXE} -mrandom -l7 -o"${JSON_PUZZLE_PATH}" -b"${ASSETS_PATH}/corpora/ef-5000.brk"

  #Render puzzle html
  python3 "${RENDER_PUZZLE}" "${PROJECT_PATH}/games/week-puzzles/templates/index-week-puzzles.html" "${JSON_PUZZLE_PATH}" "${CUR_OUT_FOLDER}" "${day}"

  #Copy js files
  cp -r "${ASSETS_PATH}/templates/word-detective/js" "${CUR_OUT_FOLDER}"
  cp "${OUTPUT_FOLDER}/js/week-puzzles.js" "${CUR_OUT_FOLDER}/js/week-puzzles.js"
done
