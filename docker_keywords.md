# Defines the containers/services in your application

services:

# Use an existing Docker image from a registry (Docker Hub, etc.)

image:

# Build an image using a Dockerfile

build:

# Give the container a custom name

container_name:

# Map host machine ports to container ports

# Example: "8000:8000"

ports:

# Expose a container port without publishing it to the host

expose:

# Define environment variables directly

environment:

# Load environment variables from a file

env_file:

# Mount files or directories between host and container

# Used for persistence or live code updates

volumes:

# Control startup dependency between services

# Example: start database before Django

depends_on:

# Attach services to custom Docker networks

networks:

# Override the default command of the image

command:

# Override the container startup executable

entrypoint:

# Define automatic restart behavior

# Examples: always, on-failure, unless-stopped

restart:

# Define checks to determine if a container is healthy

healthcheck:

# Set the working directory inside the container

working_dir:

# Run the container as a specific user/group

user:

# Keep STDIN open (useful for interactive containers)

stdin_open:

# Allocate a terminal (useful for interactive containers)

tty:

# Define persistent storage volumes

volumes:

# Define custom Docker networks

networks:

# Provide configuration files to containers

configs:

# Provide sensitive information securely

# Examples: passwords, API keys

secrets:
