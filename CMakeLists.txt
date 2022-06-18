cmake_minimum_required(VERSION 3.13)
project(word-detective)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_FLAGS "-Wall")

# Set constant to project root folder
add_definitions(-DPROJECT_SOURCE_DIR="${CMAKE_SOURCE_DIR}")

# Set build configuration variables
set(BUILD_BENCHMARKS OFF CACHE BOOL "if true, build benchmark executables")
set(BUILD_TESTS OFF CACHE BOOL "if true, build test executables")

# Control if build use shared or static libraries
set(BUILD_STATIC OFF CACHE BOOL "if true, all libraries are built and linked staticaly.")

if( ${BUILD_STATIC} )
  message("Building static libraries")
  set(BUILD_SHARED_LIBS OFF)
  set(Boost_USE_STATIC_LIBS ON)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -static")
else()
  # Export libraries locations to binaries
  message("Building dynamic libraries")
  set(BUILD_SHARED_LIBS ON)
  set(Boost_USE_STATIC_LIBS OFF)
  set(CMAKE_INSTALL_RPATH "${CMAKE_PREFIX_PATH}/lib:${CMAKE_INSTALL_PREFIX}/lib:${Boost_LIBRARY_DIRS}")
  set(CMAKE_INSTALL_RPATH_USE_LINK_PATH TRUE)
endif()

add_subdirectory(modules/datastr)
add_subdirectory(modules/standard-extensions)
add_subdirectory(modules/utils)
add_subdirectory(app/word-detective)
add_subdirectory(app/export-brick)
add_subdirectory(app/puzzle-generator)

if( ${BUILD_BENCHMARKS} )
  add_subdirectory(lab/benchmark)
endif( ${BUILD_BENCHMARKS} )

if( ${BUILD_TESTS} )
  add_subdirectory(lab/test/coverage)
endif( ${BUILD_TESTS} )
