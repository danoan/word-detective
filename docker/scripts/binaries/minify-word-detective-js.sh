#!/usr/bin/env bash

WORD_DETECTIVE_JS_SOURCE_FOLDER="${1}"

pushd "${WORD_DETECTIVE_JS_SOURCE_FOLDER}" > /dev/null
npm install
npx webpack
popd > /dev/null
