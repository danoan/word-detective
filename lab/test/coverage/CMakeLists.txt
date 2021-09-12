add_executable(test-coverage
  test-coverage.cpp
  ${CMAKE_SOURCE_DIR}/ext/catch/src/catch.cpp
  ${CMAKE_SOURCE_DIR}/modules/utils/test/test_utils_text.cpp
  ${CMAKE_SOURCE_DIR}/modules/datastr/test/test_datastr_brick.cpp
  ${CMAKE_SOURCE_DIR}/modules/datastr/test/test_datastr_trie.cpp
  ${CMAKE_SOURCE_DIR}/modules/standard-extensions/test/test_standard_extensions_io.cpp
  ${CMAKE_SOURCE_DIR}/app/word-detective/test/test_app_word_detective.cpp
  ${CMAKE_SOURCE_DIR}/app/word-detective/src/word-detective-api.cpp
)

add_dependencies(test-coverage
  utils
  datastr
  standard-extensions
)

target_include_directories(test-coverage
  PRIVATE
  ${CMAKE_SOURCE_DIR}/ext/catch/include
  ${CMAKE_SOURCE_DIR}/ext/json/include
  ${CMAKE_SOURCE_DIR}/modules/utils/include
  ${CMAKE_SOURCE_DIR}/modules/datastr/include
  ${CMAKE_SOURCE_DIR}/modules/standard-extensions/include
  ${CMAKE_SOURCE_DIR}/app/word-detective/include
  ${BOOST_INCLUDES_DIR}
)

target_link_directories(test-coverage
   PRIVATE
   ${CMAKE_BINARY_DIR}/modules/utils
   ${CMAKE_BINARY_DIR}/modules/datastr
   ${CMAKE_BINARY_DIR}/modules/standard-extensions
   ${BOOST_LIBS_DIR}
)

target_link_libraries(test-coverage
  PRIVATE
  -lutils
  -ldatastr
  -lstandard-extensions
  -lboost_filesystem
  -lboost_system
  -lgcov
)

target_compile_options(test-coverage PRIVATE
-fprofile-arcs
-ftest-coverage
)

install(TARGETS test-coverage
DESTINATION ${CMAKE_INSTALL_PREFIX}/lab)
