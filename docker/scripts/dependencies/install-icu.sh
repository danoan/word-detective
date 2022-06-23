#!/usr/bin/env bash

SOURCE_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd )"
PROJECT_ROOT="$(cd "${SOURCE_DIR}" && cd ../../.. && pwd)"
EXT_DIR="${PROJECT_ROOT}/ext"

wget https://github.com/unicode-org/icu/releases/download/release-70-1/icu4c-70_1-src.tgz -O icu4c-70_1.tgz
tar -xf icu4c-70_1.tgz

pushd icu/source 1> /dev/null
chmod +x runConfigureICU configure install-sh
./runConfigureICU Linux/gcc
./configure --enable-static=yes --with-data-packaging=static
make
make install
popd 1> /dev/null