add_library(utils SHARED
src/text/filter.cpp
src/text/english.cpp
src/timer.cpp
)

target_include_directories(utils
  PUBLIC
    include
    ${BOOST_INCLUDES_DIR}
)

target_link_libraries(utils
  -lm
)

install(DIRECTORY include
DESTINATION ${CMAKE_INSTALL_PREFIX})

install(TARGETS utils
DESTINATION ${CMAKE_INSTALL_PREFIX}/lib
ARCHIVE DESTINATION ${CMAKE_INSTALL_PREFIX}/lib)