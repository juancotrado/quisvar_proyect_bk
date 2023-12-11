import AppError from '../utils/appError';
import { userProfilePick } from '../utils/format.server';
import { enviarCorreoAgradecimiento } from '../utils/mailer';
import { Users, prisma } from '../utils/prisma.server';
import bcrypt from 'bcryptjs';

class UsersServices {
  static async getAll() {
    const users = await prisma.users.findMany({
      orderBy: { id: 'asc' },
      include: {
        profile: true,
        equipment: {
          include: {
            workStation: true,
          },
        },
      },
    });
    if (users.length == 0)
      throw new AppError('No se pudo encontrar el registro de usuarios', 404);
    return users;
  }

  static async find(id: Users['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findUser = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        profile: true,
      },
    });
    if (!findUser) throw new AppError('No se pudo encontrar el usuario', 404);
    return findUser;
  }

  static async findListTask(id: Users['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    return;
  }
  static async findListSubTask(userId: Users['id'], projectId: number) {
    if (!userId) throw new AppError('Oops!,ID invalido', 400);
    if (!projectId) {
      const subTaskGeneral = await prisma.taskOnUsers.findMany({
        where: { userId },
        orderBy: { subtaskId: 'desc' },
        select: {
          subtask: {
            include: {
              Levels: {
                select: {
                  stages: {
                    select: {
                      id: true,
                      projectId: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      console.log(JSON.stringify({ subTaskGeneral }, null, 2));
      if (!subTaskGeneral)
        throw new AppError('No se pudo encontrar las tareas', 404);
      const list = subTaskGeneral.map(s => s.subtask);
      return list;
    }
    const subtaskByTask = await prisma.subTasks.findMany({
      where: {
        users: {
          every: { userId },
        },
      },
      include: {
        users: {
          select: {
            assignedAt: true,
          },
        },
      },
    });

    if (!subtaskByTask)
      throw new AppError('No se pudo encontrar las tareas', 404);
    return subtaskByTask;
  }

  static async create({
    email,
    password,
    firstName,
    lastName,
    dni,
    phone,
    degree,
    job,
    cv,
    role,
    declaration,
    department,
    district,
    province,
    ruc,
    address,
    addressRef,
    firstNameRef,
    room,
    userPc,
    lastNameRef,
    phoneRef,
  }: userProfilePick) {
    const passwordHash = await bcrypt.hash(password, 10);
    const findUserByDNI = await prisma.profiles.findUnique({
      where: { dni },
    });
    if (findUserByDNI)
      throw new AppError('Oops!, Este DNI ya ha sido registrado', 404);
    if (phone) {
      const findUserByCell = await prisma.profiles.findUnique({
        where: { phone },
      });
      if (findUserByCell)
        throw new AppError(
          'Oops!, Este Numero de Celular ya ha sido registrado',
          404
        );
    }
    const findUserByEmail = await prisma.users.findUnique({
      where: { email },
    });
    if (findUserByEmail)
      throw new AppError('Oops!, Este Correo ya ha sido registrado', 404);
    const newUser = await prisma.users.create({
      data: {
        email,
        password: passwordHash,
        cv,
        ruc,
        address,
        declaration,
        role,
        profile: {
          create: {
            firstName,
            lastName,
            dni,
            phone,
            degree,
            job,
            department,
            province,
            district,
            addressRef,
            phoneRef,
            firstNameRef,
            room,
            userPc,
            lastNameRef,
          },
        },
      },
    });
    enviarCorreoAgradecimiento(
      email,
      `Tus datos de acceso son: \n DNI: ${dni} \n Contraseña: ${password}`
    );
    return newUser;
  }

  static async update(
    id: Users['id'],
    { role, status }: Pick<Users, 'role' | 'status'>
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateUser = await prisma.users.update({
      where: { id },
      data: {
        role,
        status,
      },
    });
    return updateUser;
  }
  static async updateStatusFile(
    id: Users['id'],
    data: { [file: string]: null | string }
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateUser = await prisma.users.update({
      where: { id },
      data,
    });
    return updateUser;
  }

  static async delete(id: Users['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const deleteUser = await prisma.users.delete({
      where: { id },
    });
    return deleteUser;
  }
}
export default UsersServices;
