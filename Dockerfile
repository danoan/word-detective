# Use gcc as base image
FROM gcc:9.4

# Update indices for apt-get
RUN apt-get update

# Install cmake
RUN apt-get install -y cmake

# Install boost
RUN apt-get install -y libboost-filesystem-dev libboost-system-dev

# Install lcov
RUN apt-get install -y lcov curl --fix-missing

# Set the working directory to /app
WORKDIR /word-detective

# Copy the docker-context directory content
COPY . /word-detective
