import AppError from '../utils/appError';
import { Users, prisma } from '../utils/prisma.server';

class ReportsServices {
  static async getReportByUser(
    userId: Users['id'],
    initialDate: Date,
    untilDate: Date
  ) {
    if (!userId) throw new AppError('Oops!, ID invalido', 400);
    const reportList = await prisma.taskOnUsers.findMany({
      where: {
        assignedAt: { gte: initialDate, lte: untilDate },
        userId,
        subtask: { status: 'DONE' },
      },
      include: {
        subtask: {
          include: {
            indexTask: {
              select: {
                id: true,
                workArea: {
                  select: {
                    id: true,
                    name: true,
                    project: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                        CUI: true,
                      },
                    },
                  },
                },
              },
            },
            task: {
              select: {
                id: true,
                indexTask: {
                  select: {
                    id: true,
                    workArea: {
                      select: {
                        id: true,
                        name: true,
                        project: {
                          select: {
                            id: true,
                            name: true,
                            description: true,
                            CUI: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            task_lvl_2: {
              select: {
                id: true,
                task: {
                  select: {
                    id: true,
                    indexTask: {
                      select: {
                        id: true,
                        workArea: {
                          select: {
                            id: true,
                            name: true,
                            project: {
                              select: {
                                id: true,
                                name: true,
                                description: true,
                                CUI: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            task_lvl_3: {
              select: {
                id: true,
                task_2: {
                  select: {
                    id: true,
                    task: {
                      select: {
                        id: true,
                        indexTask: {
                          select: {
                            id: true,
                            workArea: {
                              select: {
                                id: true,
                                name: true,
                                project: {
                                  select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    CUI: true,
                                  },
                                },
                              },
                            },
                          },
                        },
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
    if (!reportList) new AppError('no se pudo encontrar los registros', 404);
    const newReport = reportList.map(({ subtask }) => {
      let project;
      let workArea;
      if (subtask.indexTask) {
        project = subtask.indexTask.workArea.project;
        workArea = subtask.indexTask.workArea;
      }
      if (subtask.task) {
        project = subtask.task.indexTask.workArea.project;
        workArea = subtask.task.indexTask.workArea;
      }
      if (subtask.task_lvl_2) {
        project = subtask.task_lvl_2.task.indexTask.workArea.project;
        workArea = subtask.task_lvl_2.task.indexTask.workArea;
      }
      if (subtask.task_lvl_3) {
        project = subtask.task_lvl_3.task_2.task.indexTask.workArea.project;
        workArea = subtask.task_lvl_3.task_2.task.indexTask.workArea;
      }
      return { ...subtask, project, workArea };
    });
    return newReport;
  }
}
export default ReportsServices;
