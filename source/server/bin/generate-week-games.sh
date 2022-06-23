#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="$( cd "${SCRIPT_PATH}" && cd .. && pwd)"

BIN_PATH="${PROJECT_PATH}/bin"
ASSETS_PATH="${PROJECT_PATH}/assets"

PUZZLE_GEN_EXE="${BIN_PATH}/word-detective"
RENDER_PUZZLE="${BIN_PATH}/render-word-detective.py"

OUTPUT_FOLDER="${PROJECT_PATH}/games/week-puzzles"

function generate_week_games(){
  LANGUAGE="${1}"

  DAYS="sunday monday tuesday wednesday thursday friday saturday"
  for day in $DAYS
  do
    CUR_OUT_FOLDER="${OUTPUT_FOLDER}/${LANGUAGE}/${day}"
    rm -rf "${CUR_OUT_FOLDER}"

    mkdir -p "${CUR_OUT_FOLDER}/assets"
    JSON_PUZZLE_PATH="${CUR_OUT_FOLDER}/assets/puzzle.json"

    #Generate json puzzle
    ${PUZZLE_GEN_EXE} -mrandom -l7 -o"${JSON_PUZZLE_PATH}" -b"${ASSETS_PATH}/corpora/${LANGUAGE}.brk"

    #Render puzzle html
    python3 "${RENDER_PUZZLE}" "${PROJECT_PATH}/games/week-puzzles/templates/index-week-puzzles.ntl" "${JSON_PUZZLE_PATH}" "${CUR_OUT_FOLDER}" "${day}"
    mv "${CUR_OUT_FOLDER}/index.html" "${CUR_OUT_FOLDER}/index.ntl"

    #Copy js files
    mkdir -p "${CUR_OUT_FOLDER}/js"
    cp "${OUTPUT_FOLDER}/js/week-puzzles.js" "${CUR_OUT_FOLDER}/js/week-puzzles.js"
  done
}

generate_week_games "en"
generate_week_games "it"

