project(standard-extensions)

add_library(standard-extensions
src/brick/traversal.cpp)

add_dependencies(standard-extensions datastr utils)

target_include_directories(standard-extensions PUBLIC
include
${CMAKE_SOURCE_DIR}/modules/datastr/include
${CMAKE_SOURCE_DIR}/modules/utils/include
)

target_link_directories(standard-extensions PUBLIC
${CMAKE_BINARY_DIR}/modules/datastr
${CMAKE_BINARY_DIR}/modules/utils
)

target_link_libraries(standard-extensions
-ldatastr
-lutils
)

install(DIRECTORY include
DESTINATION ${CMAKE_INSTALL_PREFIX})

install(TARGETS standard-extensions
DESTINATION ${CMAKE_INSTALL_PREFIX}/lib
ARCHIVE DESTINATION ${CMAKE_INSTALL_PREFIX}/lib)