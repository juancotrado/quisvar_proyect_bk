import AppError from '../utils/appError';
import { Contratc, Group, GroupOnUsers, prisma } from '../utils/prisma.server';
class GroupServices {
  // GROUPS
  static async create(data: Group) {
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    const groups = await prisma.group.create({ data });
    return groups;
  }
  // static async deleteMod(id: Group['id']) {
  //   if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
  //   const groups = await prisma.group.update({
  //     where: { id },
  //     data: {
  //       modId: null,
  //     },
  //   });
  //   return groups;
  // }
  static async getAll() {
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        // modId: true,
        gNumber: true,
        groups: {
          where: {
            users: {
              status: true,
            },
          },
          select: {
            users: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    userPc: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        gNumber: 'asc',
      },
    });
    return groups;
  }
  static async getById(id: Group['id']) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    const groups = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        gNumber: true,

        groups: {
          orderBy: {
            users: {
              profile: {
                lastName: 'asc',
              },
            },
          },
          where: {
            users: {
              status: true,
            },
          },
          select: {
            users: {
              select: {
                id: true,
                role: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    userPc: true,
                  },
                },
              },
            },
            mod: true,
          },
        },
      },
    });
    return groups;
  }
  static async getUserTask(id: Group['id'], contractId: Contratc['id']) {
    if (!id || !contractId) throw new AppError(`Oops!, algo salio mal`, 400);
    const members = await prisma.groupOnUsers.findMany({
      where: {
        groupId: id,
      },
      select: {
        userId: true,
        users: {
          select: {
            profile: {
              select: {
                id: true,
                job: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    const subtasksByUser = [];
    for (const { userId, users } of members) {
      const userSubtasks = await prisma.taskOnUsers.findMany({
        where: {
          userId: userId,
          subtask: {
            Levels: {
              stages: {
                project: {
                  contractId,
                },
              },
            },
          },
        },
        select: {
          subtask: {
            select: {
              id: true,
              name: true,
            },
          },
          percentage: true,
        },
      });
      subtasksByUser.push({ user: { ...users }, subtasks: userSubtasks });
    }
    const data = subtasksByUser.map(item => {
      return {
        user: item.user.profile,
        subtasks: item.subtasks.map(subtask => {
          return {
            id: subtask.subtask.id,
            name: subtask.subtask.name,
            percentage: subtask.percentage,
          };
        }),
      };
    });
    return data;
  }
  static async update(
    id: Group['id'],
    name: Group['name']
    // modId?: Group['modId']
  ) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    const groups = await prisma.group.update({
      where: { id },
      data: { name },
    });
    return groups;
  }
  static async delete(id: Group['id']) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    const groups = await prisma.group.delete({ where: { id } });
    return groups;
  }
  // GROUPS RELATION ON USERS
  static async createRelation(
    userId: GroupOnUsers['userId'],
    groupId: GroupOnUsers['groupId']
  ) {
    if (!userId || !groupId) throw new AppError(`Oops!, algo salio mal`, 400);
    // const hasGroup = await prisma.groupOnUsers.findFirst({
    //   where: { userId },
    //   select: {
    //     groups: {
    //       select: {
    //         name: true,
    //       },
    //     },
    //   },
    // });
    // if (hasGroup)
    //   throw new AppError(
    //     `Oops!, Usuario ya cuenta con un grupo (${hasGroup.groups.name})`,
    //     400
    //   );
    const groups = await prisma.groupOnUsers.create({
      data: {
        userId,
        groupId,
      },
    });
    return groups;
  }
  static async updateRelation(
    userId: GroupOnUsers['userId'],
    groupId: GroupOnUsers['groupId'],
    data: GroupOnUsers
  ) {
    if (!userId || !groupId) throw new AppError(`Oops!, algo salio mal`, 400);
    const groups = await prisma.groupOnUsers.update({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      data,
    });
    return groups;
  }
  static async deleteRelation(
    userId: GroupOnUsers['userId'],
    groupId: GroupOnUsers['groupId']
  ) {
    if (!userId || !groupId) throw new AppError(`Oops!, algo salió mal`, 400);

    const deletedGroupOnUsers = await prisma.groupOnUsers.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    return deletedGroupOnUsers;
  }
  static async findProjects(id: Group['id']) {
    if (!id) throw new AppError(`Oops!, algo salió mal`, 400);
    const projects = await prisma.contratc.findMany({
      where: {
        project: {
          stages: {
            every: {
              groupId: id,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        district: true,
        cui: true,
      },
    });
    return projects;
  }
}
export default GroupServices;
