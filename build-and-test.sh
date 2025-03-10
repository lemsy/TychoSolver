#!/bin/bash

# Install dependencies if not already installed
echo "Installing dependencies..."
npm install

# Create tests directory if it doesn't exist
echo "Creating tests directory if needed..."
mkdir -p tests

# Build the project
echo "Building project..."
npm run build

# Run tests with coverage
echo "Running tests with coverage..."
npm run test:coverage

# Show test results summary
echo "Test execution complete."
echo "Check the coverage directory for detailed test coverage information."
