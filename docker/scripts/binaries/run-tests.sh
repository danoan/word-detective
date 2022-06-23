#!/usr/bin/env bash

SOURCE_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd )"
PROJECT_ROOT="$(cd "${SOURCE_DIR}" && cd ../../.. && pwd)"
BUILD_DIR="${PROJECT_ROOT}/build"
GENERATE_COVERAGE_FILES="${1:-no-generation-coverage-files}"

GCOV_FILES="${BUILD_DIR}/source/word-detective-backend/lab/test/coverage/CMakeFiles/test-coverage.dir"
COVERAGE_OUTPUT_FOLDER="${PROJECT_ROOT}/source/word-detective-backend/lab/test/coverage/output"

mkdir -p "${COVERAGE_OUTPUT_FOLDER}"

if [ ${GENERATE_COVERAGE_FILES} == '--generate-coverage-files' ]
then
  gcov "${PROJECT_ROOT}/source/word-detective-backend/lab/test/coverage/test-coverage.cpp" --object-directory "${GCOV_FILES}"

  lcov --capture --directory "${GCOV_FILES}" --output-file "${COVERAGE_OUTPUT_FOLDER}/test_coverage.info"
  # genhtml "${COVERAGE_OUTPUT_FOLDER}/test_coverage.info" --output-directory "${COVERAGE_OUTPUT_FOLDER}/report"

  bash <(curl -s https://codecov.io/bash)
fi
