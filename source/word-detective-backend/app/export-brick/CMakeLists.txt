project(export-brick)

add_executable(export-brick
export-brick.cpp
src/InputReader.cpp
src/export-brick-api.cpp)

add_dependencies(export-brick utils datastr standard-extensions)

target_include_directories(export-brick
PUBLIC
  include
  ${CMAKE_SOURCE_DIR}/source/word-detective-backend/modules/utils/include
  ${CMAKE_SOURCE_DIR}/source/word-detective-backend/modules/datastr/include
  ${CMAKE_SOURCE_DIR}/source/word-detective-backend/modules/standard-extensions/include
)

target_link_directories(export-brick
PUBLIC
  ${CMAKE_BINARY_DIR}/source/word-detective-backend/modules/utils
  ${CMAKE_BINARY_DIR}/source/word-detective-backend/modules/datastr
  ${CMAKE_BINARY_DIR}/source/word-detective-backend/modules/standard-extensions
  ${CMAKE_PREFIX_PATH}/lib
)

target_link_libraries(export-brick
-ldatastr
-lstandard-extensions
-lutils
-licuuc
-licudata
)

install(TARGETS export-brick
DESTINATION ${CMAKE_INSTALL_PREFIX}/app)
