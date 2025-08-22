#!/bin/bash

# Build script for AI service on Render
echo "Building AI service..."

# Navigate to AI service directory
cd ai_service

# Install Python dependencies
pip install -r requirements.txt

echo "AI service build complete!"
