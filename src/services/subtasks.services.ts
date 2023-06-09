import {
  Projects,
  SubTasks,
  Tasks,
  Users,
  prisma,
} from '../utils/prisma.server';
import AppError from '../utils/appError';
import fs from 'fs';
import TasksServices from './tasks.services';

class SubTasksServices {
  static async find(id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findSubTask = await prisma.subTasks.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            user: {
              select: {
                profile: true,
              },
            },
          },
        },
        task: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!findSubTask) throw new AppError('Could not found task ', 404);
    return findSubTask;
  }

  static async create({ name, price, hours, taskId, indexTaskId }: SubTasks) {
    let data = { name, price, hours };
    if (taskId) {
      const task = await TasksServices.findShort(taskId);
      const path = task.dir + '/' + task.item + '.' + task.name;
      const newSub = { ...data, taskId, path };
      data = newSub;
    }
    if (indexTaskId) {
      const indexTask = await TasksServices.findIndexTask(indexTaskId);
      const path = indexTask.dir + '/' + indexTask.item + '.' + indexTask.name;
      const newSub = { ...data, indexTaskId, path };
      data = newSub;
    }
    // const newTask = prisma.subTasks.create({
    //   data,
    //   include: {
    //     users: {
    //       select: {
    //         user: { select: { id: true, profile: true } },
    //       },
    //     },
    //   },
    // });
    return data;
  }

  static async assigned(
    id: SubTasks['id'],
    userId: Users['id'],
    option: 'decline' | 'apply' | 'review'
  ) {
    if (option == 'decline') {
      return await prisma.subTasks.update({
        where: { id },
        data: {
          status: 'UNRESOLVED',
          users: {
            deleteMany: {
              subtaskId: id,
            },
            // delete:
            //   subtaskId_userId: {
            //     subtaskId: id,
            //     userId,
            //   },
            // },
          },
        },
        include: {
          users: {
            select: {
              user: { select: { id: true, profile: true } },
            },
          },
        },
      });
    }
    if (option == 'apply') {
      return await prisma.subTasks.update({
        where: { id },
        data: {
          status: 'PROCESS',
          users: {
            create: {
              userId,
            },
          },
        },
        include: {
          users: {
            select: {
              user: { select: { id: true, profile: true } },
            },
          },
        },
      });
    }
    if (option == 'review') {
      return prisma.subTasks.update({
        where: { id },
        data: {
          status: 'INREVIEW',
        },
        include: {
          users: {
            select: {
              user: { select: { id: true, profile: true } },
            },
          },
        },
      });
    }
    throw new AppError('Oops!,We need status for this query', 400);
  }

  static async update(
    id: SubTasks['id'],
    { name, hours, price, percentage }: SubTasks
  ) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateTask = await prisma.subTasks.update({
      where: { id },
      data: {
        name,
        hours,
        price,

        percentage,
      },
    });
    return updateTask;
  }

  static async updateStatus(
    id: Tasks['id'],
    { status }: SubTasks,
    user: Users
  ) {
    const updateTaskStatus = await prisma.subTasks.update({
      where: { id },
      data: {
        status,
      },
      include: {
        users: {
          select: {
            user: { select: { id: true, profile: true } },
          },
        },
        _count: true,
      },
    });
    if (status === 'PROCESS') {
      return await prisma.subTasks.update({
        where: { id },
        data: {
          users: {
            create: {
              userId: user.id,
            },
          },
        },
        include: {
          users: {
            select: {
              user: { select: { id: true, profile: true } },
            },
          },
        },
      });
    }
    if (status === 'UNRESOLVED') {
      return await prisma.subTasks.update({
        where: { id },
        data: {
          users: {
            delete: {
              subtaskId_userId: {
                subtaskId: id,
                userId: user.id,
              },
            },
          },
        },
        include: {
          users: {
            select: {
              user: { select: { id: true, profile: true } },
            },
          },
        },
      });
    }
    return updateTaskStatus;
  }

  static async delete(id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const deleteTask = await prisma.subTasks.delete({
      where: { id },
    });
    return deleteTask;
  }
  static async upload(fileName: string, id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const uploadFile = await prisma.subTasks.update({
      where: { id },
      data: {
        // files: {
        //   push: file,
        // },
      },
      include: {
        users: {
          select: {
            user: {
              select: {
                profile: true,
              },
            },
          },
        },
      },
    });
    return uploadFile;
  }
  static async assignUserBySubtask(
    userData: { id: number; name: string }[],
    id: SubTasks['id']
  ) {
    const newUserData = userData.map(user => ({ userId: user.id }));
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    // const assignUserBySubtaskPromises = userData.map(async user => {
    return await prisma.subTasks.update({
      where: { id },
      data: {
        status: 'PROCESS',
        users: {
          create: newUserData,
        },
      },
      include: {
        users: {
          select: {
            user: {
              select: {
                profile: true,
              },
            },
          },
        },
      },
    });
    // }
    // );
    // await Promise.all(assignUserBySubtaskPromises);
    // return assignUserBySubtaskPromises[assignUserBySubtaskPromises.length - 1];
  }

  static async deleteFile(fileName: string, id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);

    const subTasks = await prisma.subTasks.findUnique({
      where: {
        id,
      },
    });
    if (!subTasks) throw new AppError('Subtarea no encotrada', 400);
    fs.unlinkSync(`./uploads/${fileName}`);
    const uploadFile = await prisma.subTasks.update({
      where: { id },
      data: {
        files: {
          // set: subTasks?.files.filter(name => name !== fileName),
        },
      },
      include: {
        users: {
          select: {
            user: {
              select: {
                profile: true,
              },
            },
          },
        },
      },
    });
    return uploadFile;
  }
}
export default SubTasksServices;
