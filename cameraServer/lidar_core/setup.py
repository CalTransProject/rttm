from setuptools import setup, Extension
import pybind11
import os

# Get source files
sources = [
    'src/packet_decoder.cpp',
    'src/scan_decoder.cpp',
    'src/stream_decoder.cpp',
    'src/python.cpp',
    'src/types.cpp'
]

# Setup the extension module
ext_modules = [
    Extension(
        "velodyne_decoder_pylib",
        sources,
        include_dirs=[
            pybind11.get_include(),
            "include",
        ],
        extra_compile_args=['-std=c++17', '-O3'],
        language='c++'
    ),
]

setup(
    name="velodyne_decoder",
    version="1.0.0",
    author="RTTM Team",
    description="Velodyne Lidar decoder for RTTM",
    ext_modules=ext_modules,
    install_requires=[
        'numpy>=1.20.0',
        'websockets>=10.0',
        'asyncio>=3.4.3'
    ],
    python_requires=">=3.8",
)
