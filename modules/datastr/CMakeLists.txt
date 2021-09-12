project(datastr)

add_library(datastr SHARED
src/Brick.cpp
src/Trie.cpp
)

target_include_directories(datastr
  PUBLIC
    include
)

install(DIRECTORY include
DESTINATION ${CMAKE_INSTALL_PREFIX})

install(TARGETS datastr
DESTINATION ${CMAKE_INSTALL_PREFIX}/lib
ARCHIVE DESTINATION ${CMAKE_INSTALL_PREFIX}/lib)