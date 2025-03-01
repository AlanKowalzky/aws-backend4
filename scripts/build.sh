#!/bin/bash

# Create dist directory
mkdir -p dist/lambdas
mkdir -p dist/mocks

# Compile TypeScript
npx tsc

# Copy compiled JS to dist folder
cp -r lib/*.js dist/
cp -r src/lambdas/*.js dist/lambdas/
cp -r src/mocks/*.js dist/mocks/

# Copy mocks into lambdas directory for deployment
cp -r dist/mocks/*.js dist/lambdas/

echo "Build completed successfully!"