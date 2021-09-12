add_executable(benchmark-word-frequency
  src/models.cpp
  benchmark-word-frequency.cpp
)

add_dependencies(benchmark-word-frequency benchmark-utils datastr utils)

target_include_directories(benchmark-word-frequency
  PRIVATE
  include
  ${CMAKE_SOURCE_DIR}/ext/json/include
  ${CMAKE_SOURCE_DIR}/ext/inja/include
  ${CMAKE_SOURCE_DIR}/modules/datastr/include
  ${CMAKE_SOURCE_DIR}/modules/utils/include
  ${CMAKE_SOURCE_DIR}/lab/benchmark/benchmark-utils/include
  ${BOOST_INCLUDES_DIR}
)

target_link_directories(benchmark-word-frequency
  PRIVATE
  ${CMAKE_BINARY_DIR}/modules/datastr
  ${CMAKE_BINARY_DIR}/modules/utils
  ${CMAKE_BINARY_DIR}/lab/benchmark/benchmark-utils
  ${BOOST_LIBS_DIR}
)

target_link_libraries(benchmark-word-frequency
  -ldatastr
  -lutils
  -lbenchmark-utils
  -lboost_filesystem
  -lboost_system
)

install(TARGETS benchmark-word-frequency
DESTINATION ${CMAKE_INSTALL_PREFIX}/lab)
