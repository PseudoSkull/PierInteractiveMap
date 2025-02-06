# Use the official Python 3.9 slim image as the base image
FROM python:3.9-slim

# Set the working directory within the container
WORKDIR /backend

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# The rest

COPY requirements.txt requirements.txt

RUN pip install --upgrade pip

RUN pip3 install -r requirements.txt

COPY . .

CMD ["python3", "app.py"]