add_executable(benchmark-word-frequency
  src/models.cpp
  benchmark-word-frequency.cpp
)

find_package(Boost 1.67 REQUIRED filesystem system)
add_dependencies(benchmark-word-frequency benchmark-utils datastr utils)

target_include_directories(benchmark-word-frequency
  PRIVATE
  include
  ${CMAKE_SOURCE_DIR}/source/word-detective-backend/ext/json/include
  ${CMAKE_SOURCE_DIR}/source/word-detective-backend/ext/inja/include
  ${CMAKE_SOURCE_DIR}/source/word-detective-backend/modules/datastr/include
  ${CMAKE_SOURCE_DIR}/source/word-detective-backend/modules/utils/include
  ${CMAKE_SOURCE_DIR}/source/word-detective-backend/lab/benchmark/benchmark-utils/include
  ${Boost_INCLUDE_DIRS}
)

target_link_directories(benchmark-word-frequency
  PRIVATE
  ${CMAKE_BINARY_DIR}/source/word-detective-backend/modules/datastr
  ${CMAKE_BINARY_DIR}/source/word-detective-backend/modules/utils
  ${CMAKE_BINARY_DIR}/source/word-detective-backend/lab/benchmark/benchmark-utils
  ${Boost_LIBRARY_DIRS}
)

target_link_libraries(benchmark-word-frequency
  -ldatastr
  -lutils
  -lbenchmark-utils
  ${Boost_LIBRARIES}
)

install(TARGETS benchmark-word-frequency
DESTINATION ${CMAKE_INSTALL_PREFIX}/lab)
