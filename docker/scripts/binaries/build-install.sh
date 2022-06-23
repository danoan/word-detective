#!/usr/bin/env bash

SOURCE_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd )"
PROJECT_ROOT="$(cd "${SOURCE_DIR}" && cd ../../.. && pwd)"

BUILD_DIR="${1:-${PROJECT_ROOT}/build}"
INSTALL_DIR="${2:-${PROJECT_ROOT}/install}"

mkdir -p "${BUILD_DIR}"
cd "${BUILD_DIR}"

cmake -DCMAKE_BUILD_TYPE=Release \
-DCMAKE_INSTALL_PREFIX="${INSTALL_DIR}" \
-DBUILD_STATIC=ON \
-DBUILD_BENCHMARKS=OFF \
-DBUILD_TESTS=ON ..

make install
