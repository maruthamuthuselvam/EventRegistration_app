# Build Stage for Frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Final Stage
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (for psycopg2 if needed)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY Backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY Backend/ ./Backend/

# Copy built frontend from build stage
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Set environment variables
ENV PORT=5001
ENV FLASK_APP=Backend/app.py

# Expose the port
EXPOSE 5001

# Start the application using gunicorn
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:$PORT Backend.app:app"]
