import { unlinkSync } from 'fs';
import AppError from '../utils/appError';
import {
  AttendanceGroup,
  Group,
  GroupList,
  prisma,
} from '../utils/prisma.server';
import { timerDay } from '../utils/tools';

class AttendanceGroupService {
  static async getUsersGroup(groupId: Group['id']) {
    const users = await prisma.groupOnUsers.findMany({
      where: { groupId, active: true },
      select: {
        users: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        users: {
          profile: {
            firstName: 'asc',
          },
        },
      },
    });
    const mod = await prisma.group.findFirst({
      where: { id: groupId },
      select: {
        moderator: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    const transformedData = [
      {
        id: mod?.moderator?.id,
        description: '',
        status: 'PUNTUAL',
        user: {
          profile: {
            firstName: mod?.moderator?.profile?.firstName,
            lastName: mod?.moderator?.profile?.lastName,
          },
        },
      },
      ...users.map(user => ({
        id: user.users.id,
        description: '',
        status: 'PUNTUAL',
        user: {
          profile: {
            firstName: user.users.profile?.firstName,
            lastName: user.users.profile?.lastName,
          },
        },
      })),
    ];
    return transformedData;
  }
  // test
  static async getListById(id: number) {
    const integrantes = await prisma.attendanceGroup.findMany({
      where: { groupListId: id },
      select: {
        userId: true,
        description: true,
        status: true,
        user: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    const integrantesArray = integrantes.map(integrante => ({
      id: integrante.user.id,
      firstName: integrante.user.profile?.firstName,
      lastName: integrante.user.profile?.lastName,
      status: integrante.status,
      description: integrante.description,
    }));

    return integrantesArray;
  }

  //Group List
  static async createList(data: GroupList) {
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    const { nombre, groupId } = data;
    const groupList = await prisma.groupList.create({
      data: {
        nombre,
        groupId,
      },
    });
    return groupList;
  }
  static async getList(date: string, groupId: GroupList['groupId']) {
    if (!date) throw new AppError(`Oops!, algo salio mal`, 400);
    const { startOfDay, endOfDay } = timerDay(date);
    const groupList = await prisma.groupList.findMany({
      where: {
        groupId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        nombre: true,
        groupId: true,
        attendance: {
          select: {
            id: true,
            description: true,
            status: true,
            user: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return groupList;
  }
  static async deleteList(id: GroupList['id']) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    const hasGroup = await prisma.groupList.findFirst({
      where: { id },
      select: {
        attendance: true,
      },
    });
    if (hasGroup && hasGroup?.attendance.length > 0)
      throw new AppError(`No puede borrar una lista con datos`, 400);
    const groupList = await prisma.groupList.delete({ where: { id } });
    return groupList;
  }
  //Group List File
  static async updateListFile(file: GroupList['file'], id: GroupList['id']) {
    if (!file || !id) throw new AppError(`Oops!, algo salio mal`, 400);
    const groupList = await prisma.groupList.update({
      where: { id },
      data: { file },
    });
    return groupList;
  }
  static async deleteListFile(id: GroupList['id']) {
    if (!id) throw new AppError(`Oops!, id no encontrado`, 400);
    const res = await prisma.groupList.findUnique({
      where: { id },
      select: {
        file: true,
      },
    });
    if (res?.file) unlinkSync(`public/groups/daily/${res.file}`);
    const consortiums = await prisma.groupList.update({
      where: { id },
      data: {
        file: null,
      },
    });
    return consortiums;
  }
  //Attendance Group
  static async create(data: AttendanceGroup[]) {
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    const attendance = await prisma.attendanceGroup.createMany({ data });
    return attendance;
  }
  static async update(id: AttendanceGroup['id'], data: AttendanceGroup) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    const attendance = await prisma.attendanceGroup.update({
      where: { id },
      data,
    });
    return attendance;
  }
}
export default AttendanceGroupService;
