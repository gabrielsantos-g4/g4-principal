$ErrorActionPreference = "Stop"

# Define variables
$IMAGE_NAME = "fmguardia/g4-principal"
$TAG = "v0.08"
$FULL_IMAGE = "${IMAGE_NAME}:${TAG}"

# Environment Variables (MATCHING deploy/stack.yml)
# NOTE: In a real CI/CD pipeline, these should be secrets. 
# For local build/manual fix, we define them here to ensure consistency.

$NEXT_PUBLIC_APP_URL = "https://app.startg4.com"
$NEXT_PUBLIC_SUPABASE_URL = "https://eookwjdxufyrokrajdfu.supabase.co"
$NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvb2t3amR4dWZ5cm9rcmFqZGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTY4MzIsImV4cCI6MjA3MDc3MjgzMn0.AZ6LxbERq7UsV7-DMyPxewEn6UBs3fkv6bGY7iM87qA"
$SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvb2t3amR4dWZ5cm9rcmFqZGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE5NjgzMiwiZXhwIjoyMDcwNzcyODMyfQ.NAm-SZuucaZ78x-VOl3vdvdGT0qt7MqDjp9pwZo7l7U"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvb2t3amR4dWZ5cm9rcmFqZGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTY4MzIsImV4cCI6MjA3MDc3MjgzMn0.AZ6LxbERq7UsV7-DMyPxewEn6UBs3fkv6bGY7iM87qA"

Write-Host "Starting build for $FULL_IMAGE..." -ForegroundColor Green

# Build Docker Image with Build Args
docker build -t $FULL_IMAGE `
    --build-arg NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL `
    --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL `
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY `
    --build-arg SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY `
    --build-arg SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY `
    --no-cache `
    .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful! Pushing to Docker Hub..." -ForegroundColor Green

# Push to Docker Hub
docker push $FULL_IMAGE

if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Success! Image $FULL_IMAGE pushed." -ForegroundColor Cyan
Write-Host "You can now update the service in Portainer or Docker Swarm." -ForegroundColor Cyan
