#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

BUILD_TYPE="${1}"

function build_binaries(){
  docker build \
  "${PROJECT_ROOT}" \
  -f "${PROJECT_ROOT}/docker/dockerfiles/Dockerfile.bins" \
  -t word-detective-bins:v0.1
}

if [ "${BUILD_TYPE}" = "binaries" ]
then
  echo "Building binaries..."
  build_binaries
fi

docker build "${SCRIPT_DIR}" \
-f "${SCRIPT_DIR}/Dockerfile" \
-t word-detective-server:v0.1
