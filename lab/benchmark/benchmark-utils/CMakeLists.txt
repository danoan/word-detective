add_library(benchmark-utils
src/render.cpp)

target_include_directories(benchmark-utils
PUBLIC
include
${CMAKE_SOURCE_DIR}/ext/json/include
${CMAKE_SOURCE_DIR}/ext/inja/include
)
