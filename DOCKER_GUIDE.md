# Docker Setup Guide

This project is containerized using Docker and Docker Compose, making it easy to run on both **Windows** and **Linux**.

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows) or [Docker Engine](https://docs.docker.com/engine/install/) (Linux).
- Docker Compose (included with Docker Desktop).

## Running the Project

1. **Clone the repository** (if you haven't already).
2. **Open a terminal** in the root directory of the project.
3. **Run the following command**:
   ```bash
   docker-compose up --build
   ```

## Services
- **Frontend**: http://localhost (Port 80)
- **Backend API**: http://localhost:5000 (Port 5000)
- **MongoDB**: localhost:27017

## Seeding the Database
To populate the database with initial data, run:
```bash
docker exec -it healthblock_backend npm run seed
```

## Stopping the Project
Press `Ctrl+C` in the terminal or run:
```bash
docker-compose down
```
