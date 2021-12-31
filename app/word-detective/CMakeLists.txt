project(word-detective)

add_executable(word-detective
word-detective.cpp
src/word-detective-api.cpp
src/InputReader.cpp
)

find_package(Boost 1.67 REQUIRED filesystem system)
add_dependencies(word-detective utils datastr standard-extensions)

target_include_directories(word-detective
  PUBLIC
    include
    ${CMAKE_SOURCE_DIR}/modules/utils/include
    ${CMAKE_SOURCE_DIR}/modules/datastr/include
    ${CMAKE_SOURCE_DIR}/modules/standard-extensions/include
    ${CMAKE_SOURCE_DIR}/ext/json/include
    ${Boost_INCLUDE_DIRS}
)

target_link_directories(word-detective
PUBLIC
  ${CMAKE_BINARY_DIR}/modules/utils
  ${CMAKE_BINARY_DIR}/modules/datastr
  ${CMAKE_BINARY_DIR}/modules/standard-extensions
  ${CMAKE_PREFIX_PATH}/lib
  ${Boost_LIBRARY_DIRS}
)

target_link_libraries(word-detective
PUBLIC
 -ldatastr
 -lstandard-extensions
 -lutils
 -licuuc
 -licudata
 ${Boost_LIBRARIES})

install(TARGETS word-detective
DESTINATION ${CMAKE_INSTALL_PREFIX}/app)