#!/usr/bin/env bash

SOURCE_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd )"
PROJECT_ROOT="$(cd "${SOURCE_DIR}" && cd ../../..&& pwd)"

pushd "${PROJECT_ROOT}/source/word-detective-js" > /dev/null
npm install
npx webpack
popd > /dev/null
