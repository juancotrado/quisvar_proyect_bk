import {
  Profiles,
  Projects,
  SubTasks,
  Tasks,
  Users,
  WorkAreas,
} from '@prisma/client';
import { prisma } from '../utils/prisma.server';
const { Prisma } = require('@prisma/client');

const newUser: Pick<Users, 'role' | 'password' | 'email'>[] = [
  {
    role: 'EMPLOYEE',
    password: 'user1',
    email: 'user1@gmail.com',
  },
  {
    role: 'EMPLOYEE',
    password: 'user2',
    email: 'user2@gmail.com',
  },
  {
    role: 'MOD',
    password: 'user3',
    email: 'user3@gmail.com',
  },
  {
    role: 'ADMIN',
    password: 'user4',
    email: 'user4@gmail.com',
  },
];

const createUsers = async () => {
  await prisma.users.createMany({
    data: newUser,
  });
};

const newProfile: Pick<
  Profiles,
  'firstName' | 'lastName' | 'dni' | 'userId'
>[] = [
  {
    firstName: 'user1',
    lastName: 'test',
    dni: '01010101',
    userId: 1,
  },
  {
    firstName: 'user2',
    lastName: 'test',
    dni: '01010102',
    userId: 2,
  },
  {
    firstName: 'user3',
    lastName: 'test',
    dni: '01010103',
    userId: 3,
  },
  {
    firstName: 'user4',
    lastName: 'test',
    dni: '01010104',
    userId: 4,
  },
];

const createProfile = async () => {
  await prisma.profiles.createMany({
    data: newProfile,
  });
};

const newWorkAreas: Pick<WorkAreas, 'name' | 'description'>[] = [
  {
    name: 'Salud',
    description: null,
  },
  {
    name: 'Educacion',
    description: null,
  },
  {
    name: 'Saneamiento',
    description: null,
  },
  {
    name: 'Carreteras',
    description: null,
  },
];

const createWorkAreas = async () => {
  await prisma.workAreas.createMany({
    data: newWorkAreas,
  });
};

const newProjects: Pick<
  Projects,
  | 'name'
  | 'description'
  | 'startDate'
  | 'untilDate'
  | 'price'
  | 'workAreaId'
  | 'usersId'
>[] = [
  {
    name: 'project1',
    description: null,
    startDate: new Date(),
    untilDate: new Date(),
    price: Prisma.Decimal('10.99'),
    workAreaId: 1,
    usersId: 1,
  },
  {
    name: 'project2',
    description: null,
    startDate: new Date(),
    untilDate: new Date(),
    price: Prisma.Decimal('10.99'),
    workAreaId: 2,
    usersId: 2,
  },
  {
    name: 'project3',
    description: null,
    startDate: new Date(),
    untilDate: new Date(),
    price: Prisma.Decimal('10.99'),
    workAreaId: 3,
    usersId: 3,
  },
  {
    name: 'project4',
    description: null,
    startDate: new Date(),
    untilDate: new Date(),
    price: Prisma.Decimal('10.99'),
    workAreaId: 4,
    usersId: 4,
  },
];

const newTask: Pick<Tasks, 'name' | 'projectId' | 'status'>[] = [
  {
    name: 'task1',
    status: 'UNRESOLVED',
    projectId: 5,
  },
  {
    name: 'task2',
    status: 'DONE',
    projectId: 5,
  },
  {
    name: 'task3',
    status: 'PROCESS',
    projectId: 6,
  },
  {
    name: 'task4',
    projectId: 7,
    status: 'UNRESOLVED',
  },
];
const createProjects = async () => {
  await prisma.projects.createMany({
    data: newProjects,
  });
};

const createTask = async () => {
  await prisma.tasks.createMany({
    data: newTask,
  });
};

const newSubtask: Pick<
  SubTasks,
  'name' | 'description' | 'hours' | 'price' | 'tasksId'
>[] = [
  {
    name: 'project1',
    description: null,
    price: 100.76,
    hours: 20,
    tasksId: 6,
  },
  {
    name: 'project2',
    description: null,
    price: 100.76,
    hours: 20,
    tasksId: 5,
  },
  {
    name: 'project3',
    description: null,
    price: 100.76,
    hours: 20,
    tasksId: 5,
  },
  {
    name: 'project4',
    description: null,
    price: 100.76,
    hours: 20,
    tasksId: 7,
  },
];

const createSubTask = async () => {
  await prisma.subTasks.createMany({
    data: newSubtask,
  });
};

createUsers();
createProfile();
createWorkAreas();
createProjects();
createTask();
createSubTask();
