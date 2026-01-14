#!/bin/bash

# Configuration
IMAGE_NAME="fmguardia/g4-principal"
TAG="v0.10"

echo "Using image: $IMAGE_NAME:$TAG"

# Build for linux/amd64 (server architecture)
echo "Building image..."
docker build --platform linux/amd64 -t $IMAGE_NAME:$TAG .

# Push to Docker Hub
echo "Pushing image..."
docker push $IMAGE_NAME:$TAG

echo "Build and push complete!"
