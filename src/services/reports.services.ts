import AppError from '../utils/appError';
import { Projects, Users, prisma } from '../utils/prisma.server';

class ReportsServices {
  static async getReportByUser(
    userId: Users['id'],
    initialDate: Date,
    untilDate: Date,
    status: 'DONE' | 'LIQUIDATION'
  ) {
    if (!userId) throw new AppError('Oops!, ID invalido', 400);
    const GMT = 60 * 60 * 1000;
    const _startDate = new Date(initialDate).getTime();
    const _endDate = new Date(untilDate).getTime();
    const startOfDay = new Date(_startDate + GMT * 5);
    const endOfDay = new Date(_endDate + GMT * 29 - 1);
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            dni: true,
            phone: true,
            description: true,
            degree: true,
          },
        },
      },
    });
    const reportList = await prisma.taskOnUsers.findMany({
      where: {
        assignedAt: { gte: startOfDay, lte: endOfDay },
        userId,
        subtask: { status },
      },
      select: {
        percentage: true,
        untilDate: true,
        assignedAt: true,
        subtask: {
          select: {
            item: true,
            days: true,
            status: true,
            description: true,
            price: true,
            name: true,
            feedBacks: true,
            users: true,
            Levels: {
              select: {
                stages: {
                  select: {
                    moderator: {
                      select: {
                        profile: {
                          select: {
                            userId: true,
                            firstName: true,
                            lastName: true,
                            description: true,
                          },
                        },
                      },
                    },
                    project: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                        CUI: true,
                        percentage: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const projectList = await prisma.projects.findMany({
      select: {
        id: true,
        name: true,
        CUI: true,
        description: true,
        district: true,
        percentage: true,
        moderator: {
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
    });
    //----------------------------------------------------------------------------
    const list = await prisma.listOnUsers.groupBy({
      by: ['status'],
      where: {
        usersId: userId,
        assignedAt: { gte: startOfDay, lte: endOfDay },
      },
      _count: { status: true },
    });
    const attendance = list.reduce((acc: { [key: string]: number }, _list) => {
      const status = _list.status;
      if (!acc[status]) acc[status] = 0;
      acc[status] = _list._count.status;
      return acc;
    }, {});
    //----------------------------------------------------------------------------
    if (!user) throw new AppError('Oops!, ID invalido', 400);
    if (!reportList) new AppError('no se pudo encontrar los registros', 404);
    const newReport = reportList.map(({ subtask, ...data }) => {
      const project = subtask.Levels.stages.project;
      const { Levels, ..._subTask } = subtask;
      console.log(Levels);
      return { ...data, ..._subTask, project };
    });
    const newReportByList = projectList.map(_project => {
      const subtasks = newReport.filter(
        ({ project }) => project.id === _project.id
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const newSubTask = subtasks.map(({ project, ...a }) => ({
        ...a,
      }));

      return { ..._project, subtasks: newSubTask };
    });
    const projects = newReportByList.filter(
      project => project.subtasks.length !== 0
    );
    return { user, attendance, projects };
  }

  static async getSubTasksByProyect(projectId: Projects['id']) {
    console.log(projectId);
    const findSubtasks = await prisma.subTasks.findMany({
      where: {
        // OR: [
        //   {
        //     task_lvl_3: {
        //       task_2: { task: { indexTask: { workArea: { projectId } } } },
        //     },
        //   },
        //   {
        //     indexTask: { workArea: { projectId } },
        //   },
        //   {
        //     task_lvl_2: { task: { indexTask: { workArea: { projectId } } } },
        //   },
        //   {
        //     task: { indexTask: { workArea: { projectId } } },
        //   },
        // ],
      },
      select: {
        id: true,
        status: true,
        files: {
          select: { id: true, dir: true, type: true, subTasksId: true },
        },
      },
    });
    return findSubtasks;
  }
}
export default ReportsServices;
