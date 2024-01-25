# Task Manager Backend

![Dhyrium API](/404_page/img/dhyrium_logo.png)

This is a backend API for a system that manages courses and students. It provides endpoints for creating, retrieving, updating, and deleting courses.

## Documentation

Detailed documentation on API endpoints is found [here](https://google.com) or [/api-docs](http://localhost:8081/api-docs).

## Configuration

Before running the backend, ensure that you have the following dependencies installed:

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (make sure you have a running PostgreSQL instance)

## Tools Dev

Backend made with TS, Express and Prisma

- [Express](https://expressjs.com/en/guide/routing.html)
- [Prisma](https://www.prisma.io/)

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/juancotrado/quisvar_proyect_bk.git
   ```

2. Install dependences:

   ```bash
   npm install
   ```

## Running

### Run Development

- Command to run in development mode

  ```bash
  npm run dev
  ```

### Run Production

- Command to run in production mode

  ```bash
  npm run start
  ```

  ### Run Production

- Initialize with seed with next command

  ```sh
  npm run seed
  ```

## Migrate with prisma

1. Initialize schema on database and project:

   ```bash
    npx prisma generate
   ```

2. Migrate schema to database:

   ```bash
   npx prisma db push
   ```

3. If you need pull schema from database:

   ```bash
   npx prisma db pull
   ```

## Deployment with Docker Compose

### Start Deploy

- This command starts the containers specified in your docker-compose.yml file in detached mode (in the background).

  ```bash
  docker-compose up -d
  ```

- If you have some changes you can reboot with the following command

  ```bash
  docker restart "container_name_or_id"
  ```

### Container Configuration

- Enter a Docker container, use the following command

  ```bash
  docker exec -it "container_name_or_id" bash
  ```

### Backups with PostgreSQL Container

1. Enter a Docker container:

   ```bash
   docker exec -it "container_name_or_id" bash
   ```

2. Create backup with custom name:

   ```bash
   pg_dump -U "database_user" -d "database_name" > backup.sql
   ```

3. Copy backup on custom directory:

   ```bash
   docker cp "container_name_or_id":/backup.sql "root_directory"/backup_$(date +"%Y%m%d_%H%M%S").sql
   ```

### Other Commands

```bash
docker-compose down
```
