add_library(utils
src/text/filter.cpp
src/text/english.cpp
src/text/italian.cpp
src/text/french.cpp
src/timer.cpp
src/unicode.cpp
)

target_include_directories(utils PUBLIC
  include
  ${CMAKE_PREFIX_PATH}/include
)

target_link_directories(utils PUBLIC
  ${CMAKE_PREFIX_PATH}/lib
)

target_link_libraries(utils
  -lm
  -licuuc
  -licudata
)

install(DIRECTORY include
DESTINATION ${CMAKE_INSTALL_PREFIX})

install(TARGETS utils
DESTINATION ${CMAKE_INSTALL_PREFIX}/lib
ARCHIVE DESTINATION ${CMAKE_INSTALL_PREFIX}/lib)