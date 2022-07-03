#!/usr/bin/env bash

SOURCE_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd )"
PROJECT_ROOT="$(cd "${SOURCE_DIR}" && cd ../../.. && pwd)"

PACKAGE_SOURCE="${1}"
VENV_PATH="${2}"

if [[ ! -d "${VENV_PATH}" ]]
then
  python3 -m venv "${VENV_PATH}"
fi

source "${VENV_PATH}/bin/activate"

pushd "${PACKAGE_SOURCE}" > /dev/null
pip install .
popd > /dev/null