#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}" && cd ../.. && pwd)"

BUILD_TYPE="${1}"

function build_dependencies()
{
  docker build "${PROJECT_ROOT}" \
  -f "${PROJECT_ROOT}/docker/dockerfiles/Dockerfile.dependencies" \
  -t word-detective-dependencies:v0.1
}

function build_binaries(){
  docker build "${PROJECT_ROOT}" \
  -f "${PROJECT_ROOT}/docker/dockerfiles/Dockerfile.bins" \
  -t word-detective-bins:v0.1
}

if [ "${BUILD_TYPE}" = "binaries" ]
then
  echo "Building binaries..."
  build_binaries
elif [ "${BUILD_TYPE}" = "dependencies" ]
then
  echo "Building dependencies..."
  build_dependencies
elif [ "${BUILD_TYPE}" = "all" ]
then
  echo "Building all..."
  build_dependencies
  build_binaries
else
  echo "Build type: '${BUILD_TYPE}' not recognized"
  exit 1
fi

docker build "${SCRIPT_DIR}" \
-f "${SCRIPT_DIR}/Dockerfile" \
-t word-detective-server:v0.1
