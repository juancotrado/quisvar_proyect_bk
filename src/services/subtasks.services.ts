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
import PathServices from './paths.services';
class SubTasksServices {
  static async find(id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findSubTask = await prisma.subTasks.findUnique({
      where: { id },
      include: {
        files: {
          include: {
            user: {
              select: {
                profile: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
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
    if (!findSubTask) throw new AppError('No se pudo encontrar la tares ', 404);
    return findSubTask;
  }

  static async create({ name, price, hours, taskId, indexTaskId }: SubTasks) {
    let data = { name, price, hours };
    if (taskId) {
      const quantityTask = await prisma.subTasks.count({ where: { taskId } });
      const task = await TasksServices.findShort(taskId);
      const item = task.item + '.' + (quantityTask + 1);
      const newSub = { ...data, taskId, item };
      data = newSub;
    }
    if (indexTaskId) {
      const indexTask = await TasksServices.findIndexTask(indexTaskId);
      const quantityIndexTask = await prisma.subTasks.count({
        where: { indexTaskId },
      });
      const item = indexTask.item + '.' + (quantityIndexTask + 1);
      const newSub = { ...data, indexTaskId, item };
      data = newSub;
    }
    const newTask = await prisma.subTasks.create({
      data,
      include: {
        users: {
          select: {
            user: { select: { id: true, profile: true } },
          },
        },
      },
    });
    return newTask;
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
          files: {
            select: {
              dir: true,
              name: true,
              subTasksId: true,
              type: true,
              user: {
                select: {
                  profile: {
                    select: { id: true, firstName: true, lastName: true },
                  },
                },
              },
            },
          },
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
          files: {
            select: {
              dir: true,
              name: true,
              subTasksId: true,
              type: true,
              user: {
                select: {
                  profile: {
                    select: { id: true, firstName: true, lastName: true },
                  },
                },
              },
            },
          },
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
          files: {
            select: {
              dir: true,
              name: true,
              subTasksId: true,
              type: true,
              user: {
                select: {
                  profile: {
                    select: { id: true, firstName: true, lastName: true },
                  },
                },
              },
            },
          },
          users: {
            select: {
              user: { select: { id: true, profile: true } },
            },
          },
        },
      });
    }
    throw new AppError('Oops!, Necesitamos un status para esta consulta', 400);
  }

  static async update(
    id: SubTasks['id'],
    { name, hours, price, percentage }: SubTasks
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTask = await prisma.subTasks.update({
      where: { id },
      data: {
        name,
        hours,
        price,
        percentage,
      },
      include: {
        users: {
          select: {
            user: { select: { id: true, profile: true } },
          },
        },
      },
    });
    return updateTask;
  }

  static async updateStatus(
    id: SubTasks['id'],
    { status }: SubTasks,
    user: Users
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTaskStatus = await prisma.subTasks.update({
      where: { id },
      data: {
        status,
      },
      include: {
        files: {
          select: {
            dir: true,
            name: true,
            subTasksId: true,
            type: true,
            user: {
              select: {
                profile: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
        users: {
          select: {
            user: { select: { id: true, profile: true } },
          },
        },
        _count: true,
      },
    });
    const subTask = await prisma.subTasks.findUnique({ where: { id } });
    if (!subTask) throw new AppError('Oops!,ID invalido', 400);
    if (status === 'DONE') {
      const files = await prisma.files.findMany({
        where: { subTasksId: id, type: 'REVIEW' },
      });
      const oldDir = await PathServices.pathSubTask(id, 'REVIEW');
      const newDir = await PathServices.pathSubTask(id, 'SUCCESSFUL');

      files.forEach(async file => {
        const ext = file.name.split('@').at(-1);
        const newFileName = subTask.item + '.' + subTask.name + ext;
        await prisma.files.update({
          where: { id: file.id },
          data: { type: 'SUCCESSFUL', name: newFileName, dir: newDir },
        });
        fs.renameSync(`${oldDir}/${file.name}`, `${newDir}/${newFileName}`);
      });
    }
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
          files: {
            select: {
              dir: true,
              name: true,
              subTasksId: true,
              type: true,
              user: {
                select: {
                  profile: {
                    select: { id: true, firstName: true, lastName: true },
                  },
                },
              },
            },
          },
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
          files: {
            select: {
              dir: true,
              name: true,
              subTasksId: true,
              type: true,
              user: {
                select: {
                  profile: {
                    select: { id: true, firstName: true, lastName: true },
                  },
                },
              },
            },
          },
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
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const subTask = await prisma.subTasks.findUnique({ where: { id } });
    if (subTask && subTask.taskId) {
      const { taskId } = subTask;
      const deleteTask = await prisma.subTasks.delete({
        where: { id },
      });
      const getSubTasks = await prisma.subTasks.findMany({
        where: { taskId },
        include: {
          task: { select: { item: true } },
        },
      });
      getSubTasks.forEach(async (subTask, index) => {
        await prisma.subTasks.update({
          where: { id: subTask.id },
          data: { item: `${subTask.task?.item}.${index + 1}` },
        });
      });
      return deleteTask;
    }
    if (subTask && subTask.indexTaskId) {
      const { indexTaskId } = subTask;
      const deleteTask = await prisma.subTasks.delete({
        where: { id },
      });
      const getSubTasks = await prisma.subTasks.findMany({
        where: { indexTaskId },
        include: {
          indexTask: { select: { item: true } },
        },
      });
      getSubTasks.forEach(async (subTask, index) => {
        await prisma.subTasks.update({
          where: { id: subTask.id },
          data: { item: `${subTask.indexTask?.item}.${index + 1}` },
        });
      });
      return deleteTask;
    }
    throw new AppError(`No se pudo eliminar la subtarea`, 400);
  }

  static async upload(fileName: string, id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
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
    if (!id) throw new AppError('Oops!,ID invalido', 400);
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
        files: {
          include: {
            user: {
              select: {
                profile: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
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
    if (!id) throw new AppError('Oops!,ID invalido', 400);

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
