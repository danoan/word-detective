project(datastr)

add_library(datastr
src/Brick.cpp
src/Trie.cpp
)

add_dependencies(datastr utils)

target_include_directories(datastr
  PUBLIC
    include
    ${CMAKE_SOURCE_DIR}/source/word-detective-backend/modules/utils/include
)

target_link_directories(datastr
PUBLIC
  ${CMAKE_BINARY_DIR}/source/word-detective-backend/modules/utils
)

target_link_libraries(datastr
  -lutils
)

install(DIRECTORY include
DESTINATION ${CMAKE_INSTALL_PREFIX})

install(TARGETS datastr
DESTINATION ${CMAKE_INSTALL_PREFIX}/lib
ARCHIVE DESTINATION ${CMAKE_INSTALL_PREFIX}/lib)