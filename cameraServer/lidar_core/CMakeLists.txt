cmake_minimum_required(VERSION 3.10)
project(rttm_lidar)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(pybind11 REQUIRED)

# Add source files
set(SOURCES
    src/packet_decoder.cpp
    src/scan_decoder.cpp
    src/stream_decoder.cpp
    src/python.cpp
    src/types.cpp
)

# Create Python module
pybind11_add_module(velodyne_decoder_pylib ${SOURCES})

# Include directories
target_include_directories(velodyne_decoder_pylib PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Set compile options
target_compile_options(velodyne_decoder_pylib PRIVATE
    -Wall
    -Wextra
    -O3
)

# Install targets
install(TARGETS velodyne_decoder_pylib
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
)
