#!/usr/bin/env bash
# exit on error
set -o errexit

# Install backend dependencies
pip install -r Backend/requirements.txt

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Done
