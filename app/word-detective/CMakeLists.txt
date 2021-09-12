project(word-detective)

add_executable(word-detective
word-detective.cpp
src/word-detective-api.cpp
src/InputReader.cpp
)

add_dependencies(word-detective utils datastr standard-extensions)

target_include_directories(word-detective
  PUBLIC
    include
    ${CMAKE_SOURCE_DIR}/modules/utils/include
    ${CMAKE_SOURCE_DIR}/modules/datastr/include
    ${CMAKE_SOURCE_DIR}/modules/standard-extensions/include
    ${CMAKE_SOURCE_DIR}/ext/json/include
    ${BOOST_INCLUDES_DIR}
)

target_link_directories(word-detective
PUBLIC
  ${CMAKE_BINARY_DIR}/modules/utils
  ${CMAKE_BINARY_DIR}/modules/datastr
  ${CMAKE_BINARY_DIR}/modules/standard-extensions
  ${BOOST_LIBS_DIR}
)

target_link_libraries(word-detective
PUBLIC
 -lutils
 -ldatastr
 -lstandard-extensions
 -lboost_filesystem
 -lboost_system)

install(TARGETS word-detective
DESTINATION ${CMAKE_INSTALL_PREFIX}/app)