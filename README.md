# Task Manager Backend

## Tools

Backend made with TS, Express and Prisma

- [Express](https://expressjs.com/en/guide/routing.html)
- [Prisma](https://www.prisma.io/)

## Development

Install dependences

```sh
npm install
```

Start the development asset server and the Express server by running:

```sh
npm run dev
```

initialize with seed with next command:

```sh
npm run seed
```

## Deployment

Then run the app in production mode:

```sh
npm run start
```

## Docker command

```sh
docker-compose up -d
```

```sh
docker-compose down
```

```sh
docker restat "name"
```

```sh
docker exec -it "name_contenr" bash
```

## Docker command database Backup

```sh
docker exec -it ${container_name} bash
```

create backup with datetime

```sh
pg_dump -U ${user} -d ${database_name} > backup.sql
```

copy backup out container

```sh
docker cp ${container_name}:/backup.sql ${root}/backup_$(date +"%Y%m%d_%H%M%S").sql
```
