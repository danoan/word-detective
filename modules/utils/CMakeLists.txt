add_library(utils
src/text/filter.cpp
src/text/english.cpp
src/timer.cpp
)

target_include_directories(utils
  PUBLIC
    include
)

target_link_libraries(utils
  -lm
)

install(DIRECTORY include
DESTINATION ${CMAKE_INSTALL_PREFIX})

install(TARGETS utils
DESTINATION ${CMAKE_INSTALL_PREFIX}/lib
ARCHIVE DESTINATION ${CMAKE_INSTALL_PREFIX}/lib)