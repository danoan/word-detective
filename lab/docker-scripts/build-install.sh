#!/usr/bin/env bash

mkdir build
cd build
cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/word-detective/install -DBUILD_BENCHMARKS=OFF -DBUILD_TESTS=ON ..
make install
