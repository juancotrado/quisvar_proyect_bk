import {
  Profiles,
  TaskRole,
  Tasks,
  Users,
  UsersOnTasks,
  WorkAreas,
} from '@prisma/client';
import { userProfilePick } from '../utils/format.server';
import { prisma } from '../utils/prisma.server';
const { Prisma, PrismaClient } = require('@prisma/client');
const { Decimal } = Prisma;

const newUser: Users[] = [
  {
    id: 1,
    status: false,
    role: 'EMPLOYEE',
    password: 'user1',
    email: 'user1@gmail.com',
    createdAt: new Date('2022-05-12T12:30:00Z'),
    updatedAt: new Date('2022-05-12T12:30:00Z'),
    workAreaId: 1,
  },
  {
    id: 2,
    status: false,
    role: 'EMPLOYEE',
    password: 'user2',
    email: 'user2@gmail.com',
    createdAt: new Date('2022-05-12T12:30:00Z'),
    updatedAt: new Date('2022-05-12T12:30:00Z'),
    workAreaId: 1,
  },
  {
    id: 3,
    status: false,
    role: 'MOD',
    password: 'user3',
    email: 'user3@gmail.com',
    createdAt: new Date('2022-05-12T12:30:00Z'),
    updatedAt: new Date('2022-05-12T12:30:00Z'),
    workAreaId: 1,
  },
  {
    id: 4,
    status: false,
    role: 'ADMIN',
    password: 'user4',
    email: 'user4@gmail.com',
    createdAt: new Date('2022-05-12T12:30:00Z'),
    updatedAt: new Date('2022-05-12T12:30:00Z'),
    workAreaId: 1,
  },
];

const createUsers = async () => {
  await prisma.users.createMany({
    data: newUser,
  });
};

const newProfile: Profiles[] = [
  {
    id: 1,
    firstName: 'user1',
    lastName: 'test',
    dni: '01010101',
    phone: null,
    updatedAt: new Date('2022-05-12T12:30:00Z'),
    userId: 1,
  },
  {
    id: 2,
    firstName: 'user2',
    lastName: 'test',
    dni: '01010102',
    phone: null,
    updatedAt: new Date('2022-05-12T12:30:00Z'),
    userId: 2,
  },
  {
    id: 3,
    firstName: 'user3',
    lastName: 'test',
    dni: '01010103',
    phone: null,
    updatedAt: new Date('2022-05-12T12:30:00Z'),
    userId: 3,
  },
  {
    id: 4,
    firstName: 'user4',
    lastName: 'test',
    dni: '01010104',
    phone: null,
    updatedAt: new Date('2022-05-12T12:30:00Z'),
    userId: 4,
  },
];

const createProfile = async () => {
  await prisma.profiles.createMany({
    data: newProfile,
  });
};

const newWorkAreas: WorkAreas[] = [
  {
    id: 1,
    name: 'Salud',
    createdAt: new Date('2022-05-12T12:30:00Z'),
  },
  {
    id: 2,
    name: 'Educacion',
    createdAt: new Date('2022-05-12T12:30:00Z'),
  },
  {
    id: 3,
    name: 'Saneamiento',
    createdAt: new Date('2022-05-12T12:30:00Z'),
  },
  {
    id: 4,
    name: 'Carreteras',
    createdAt: new Date('2022-05-12T12:30:00Z'),
  },
];

const createWorkAreas = async () => {
  await prisma.workAreas.createMany({
    data: newWorkAreas,
  });
};

const newTask: Tasks[] = [
  {
    id: 1,
    name: 'task1',
    description: null,
    price: Prisma.Decimal('10.99'),
    status: 'UNRESOLVED',
    createdAt: new Date(),
    updatedAt: new Date(),
    workAreaId: 1,
  },
  {
    id: 2,
    name: 'task2',
    description: null,
    price: Prisma.Decimal('10.99'),
    status: 'UNRESOLVED',
    createdAt: new Date(),
    updatedAt: new Date(),
    workAreaId: 2,
  },
  {
    id: 3,
    name: 'task3',
    description: null,
    price: Prisma.Decimal('10.99'),
    status: 'DONE',
    createdAt: new Date(),
    updatedAt: new Date(),
    workAreaId: 3,
  },
  {
    id: 4,
    name: 'task4',
    description: null,
    price: Prisma.Decimal('10.99'),
    status: 'PROCESS',
    createdAt: new Date(),
    updatedAt: new Date(),
    workAreaId: 4,
  },
];

const createTask = async () => {
  await prisma.tasks.createMany({
    data: newTask,
  });
};
const newUserOnTask: UsersOnTasks[] = [
  {
    userId: 1,
    taskId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 2,
    taskId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 3,
    taskId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 4,
    taskId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const createUserOnTask = async () => {
  await prisma.usersOnTasks.createMany({
    data: newUserOnTask,
  });
};
