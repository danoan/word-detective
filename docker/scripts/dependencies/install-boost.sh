#!/usr/bin/env bash

SOURCE_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd )"
PROJECT_ROOT="$(cd "${SOURCE_DIR}" && cd ../../.. && pwd)"
EXT_DIR="${PROJECT_ROOT}/ext"

wget https://archives.boost.io/release/1.76.0/source/boost_1_76_0.tar.bz2 -O boost.tar.bz2
tar x -jf boost.tar.bz2

pushd boost_1_76_0 1> /dev/null
./bootstrap.sh --with-libraries=filesystem,system --prefix=/usr/local
./b2 install
popd 1> /dev/null
