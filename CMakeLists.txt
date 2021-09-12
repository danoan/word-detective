cmake_minimum_required(VERSION 3.13)
project(word-detective)

# Set constant to project root folder
add_definitions(-DPROJECT_SOURCE_DIR="${CMAKE_SOURCE_DIR}")

# Default path to required libraries
set(BOOST_INCLUDES_DIR "/usr/local/include" CACHE PATH "Path to boost includes directory" )
set(BOOST_LIBS_DIR "/usr/local/lib" CACHE PATH "Path to boost libraries directory" )

# Set build configuration variables
set(BUILD_BENCHMARKS OFF CACHE BOOL "if true, build benchmark executables")
set(BUILD_TESTS OFF CACHE BOOL "if true, build test executables")


# Export libraries locations to binaries
set(CMAKE_INSTALL_RPATH "${CMAKE_INSTALL_PREFIX}/lib:${BOOST_LIBS_DIR}")
set(CMAKE_INSTALL_RPATH_USE_LINK_PATH TRUE)

add_subdirectory(modules/datastr)
add_subdirectory(modules/standard-extensions)
add_subdirectory(modules/utils)
add_subdirectory(app/word-detective)
add_subdirectory(app/export-brick)

if( ${BUILD_BENCHMARKS} )
  add_subdirectory(lab/benchmark)
endif( ${BUILD_BENCHMARKS} )

if( ${BUILD_TESTS} )
  add_subdirectory(lab/test/coverage)
endif( ${BUILD_TESTS} )
