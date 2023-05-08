import { PrismaClient } from "@prisma/client";
let prisma: PrismaClient;
declare global {
  var db: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect();
  console.log("Database is under Production");
} else {
  if (!global.db) {
    console.log("Database is under Development");
    global.db = new PrismaClient();
    global.db.$connect();
  } 
  prisma = global.db;
}

export * from "@prisma/client";
export { prisma };