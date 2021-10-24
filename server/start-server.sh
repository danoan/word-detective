#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORD_DETECTIVE_ROOT="$(cd "${SCRIPT_DIR}" && cd .. && pwd)"

BUILD_BINARIES="${1}"

if [ -n "${BUILD_BINARIES}" ]
then
  echo "Building binaries..."

  docker build "${WORD_DETECTIVE_ROOT}" \
  -f "${WORD_DETECTIVE_ROOT}/Dockerfile.bins" \
  -t word-detective-bins:v0.1
fi

docker build "${SCRIPT_DIR}" \
-f "${SCRIPT_DIR}/Dockerfile" \
-t word-detective-server:v0.1
