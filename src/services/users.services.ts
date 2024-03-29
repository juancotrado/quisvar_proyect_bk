import AppError from '../utils/appError';
import { userProfilePick } from '../utils/format.server';
import { enviarCorreoAgradecimiento } from '../utils/mailer';
import { Profiles, Users, prisma } from '../utils/prisma.server';
import bcrypt from 'bcryptjs';
import RoleService from './role.service';
import { MenuPoints } from '../models/menuPoints';
const menuPoints = new MenuPoints();

class UsersServices {
  static async getAll() {
    const users = await prisma.users.findMany({
      where: {
        role: {
          hierarchy: { in: [1, 2] },
        },
      },
      orderBy: [
        // {
        //   role: {
        //     hierarchy: ,
        //   },
        // },
        {
          profile: {
            lastName: 'asc',
          },
        },
      ],
      include: {
        profile: true,
        role: {
          include: {
            menuPoints: {
              select: {
                id: true,
                menuId: true,
                typeRol: true,
                subMenuPoints: {
                  select: {
                    id: true,
                    menuId: true,
                    typeRol: true,
                  },
                },
              },
            },
          },
        },
        equipment: {
          include: {
            workStation: true,
          },
        },
      },
    });
    const employees = await prisma.users.findMany({
      where: {
        role: {
          hierarchy: { gte: 3 },
        },
      },
      orderBy: [
        // {
        //   role: {
        //     hierarchy: 'asc',
        //   },
        // },
        {
          profile: {
            lastName: 'asc',
          },
        },
      ],
      include: {
        profile: true,
        role: {
          include: {
            menuPoints: {
              select: {
                id: true,
                menuId: true,
                typeRol: true,
                subMenuPoints: {
                  select: {
                    id: true,
                    menuId: true,
                    typeRol: true,
                  },
                },
              },
            },
          },
        },
        equipment: {
          include: {
            workStation: true,
          },
        },
      },
    });
    const merge = [...users, ...employees];
    if (merge.length == 0)
      throw new AppError('No se pudo encontrar el registro de usuarios', 404);

    const userWithMenus = merge.map(({ password, ...user }) =>
      password && user.role
        ? {
            ...user,
            role: menuPoints.getHeadersOptions(user.role),
          }
        : user
    );

    return userWithMenus;
  }

  static async find(id: Users['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findUser = await prisma.users.findUnique({
      where: { id },
      include: {
        profile: true,
        offices: { select: { officeId: true } },
        // office: { select: { id: true, name: true } },
      },
    });
    if (!findUser) throw new AppError('No se pudo encontrar el usuario', 404);
    const role = await RoleService.findGeneral(findUser.roleId!);
    return { ...findUser, role };
  }

  static async findForSign(id: Users['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findUser = await prisma.users.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!findUser) throw new AppError('No se pudo encontrar el usuario', 404);
    return findUser;
  }

  static async findByDni(dni: Profiles['dni']) {
    if (!dni) throw new AppError('Oops!,dni invalido', 409);
    const findUser = await prisma.users.findFirst({
      where: {
        profile: {
          dni,
        },
      },
      include: {
        profile: true,
      },
    });
    if (!findUser) throw new AppError('No se pudo encontrar el usuario', 404);
    return findUser;
  }
  static async findByTokenAndId(id: number, token: string) {
    const findUser = await prisma.users.findFirst({
      where: {
        id,
        verificationUser: {
          token,
        },
      },
    });
    if (!findUser) throw new AppError('Algo salio mal', 404);
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
    description,
    roleId,
    gender,
  }: userProfilePick) {
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        email,
        password: passwordHash,
        cv,
        ruc,
        address,
        declaration,
        roleId: +roleId!,
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
            description,
            gender,
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

  static async update(id: Users['id'], { status }: Pick<Users, 'status'>) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateUser = await prisma.users.update({
      where: { id },
      data: {
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
