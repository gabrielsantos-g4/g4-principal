#!/bin/bash

# Configuration
IMAGE_NAME="gabrielsantosg4/g4-principal"
TAG="0.1.31"

echo "Using image: $IMAGE_NAME:$TAG"

# Build for linux/amd64 (server architecture)
# Build for linux/amd64 (server architecture)
echo "Building image..."

# Load env vars
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  --build-arg SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  --build-arg SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  --build-arg R2_ACCOUNT_ID=$R2_ACCOUNT_ID \
  --build-arg NEXT_PUBLIC_R2_PUBLIC_DOMAIN=$NEXT_PUBLIC_R2_PUBLIC_DOMAIN \
  --build-arg R2_BUCKET_NAME=$R2_BUCKET_NAME \
  --build-arg R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID \
  --build-arg R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY \
  --build-arg OPENAI_API_KEY=$OPENAI_API_KEY \
  -t $IMAGE_NAME:$TAG \
  -t $IMAGE_NAME:latest .

# Push to Docker Hub
echo "Pushing image..."
docker push $IMAGE_NAME:$TAG

echo "Build and push complete!"
