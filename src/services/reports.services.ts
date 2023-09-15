import AppError from '../utils/appError';
import { Projects, Users, prisma } from '../utils/prisma.server';
import Queries from '../utils/queries';

class ReportsServices {
  static async getReportByUser(
    userId: Users['id'],
    initialDate: Date,
    untilDate: Date,
    status: 'DONE' | 'LIQUIDATION'
  ) {
    if (!userId) throw new AppError('Oops!, ID invalido', 400);
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
          },
        },
      },
    });
    const reportList = await prisma.taskOnUsers.findMany({
      where: {
        assignedAt: { gte: initialDate, lte: untilDate },
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
            // indexTask: {
            //   select: {
            //     id: true,
            //     workArea: {
            //       select: {
            //         id: true,
            //         name: true,
            //         project: {
            //           select: {
            //             id: true,
            //             name: true,
            //             description: true,
            //             CUI: true,
            //           },
            //         },
            //       },
            //     },
            //   },
            // },
            // task: {
            //   select: {
            //     id: true,
            //     indexTask: {
            //       select: {
            //         id: true,
            //         workArea: {
            //           select: {
            //             id: true,
            //             name: true,
            //             project: {
            //               select: {
            //                 id: true,
            //                 name: true,
            //                 description: true,
            //                 CUI: true,
            //                 district: true,
            //               },
            //             },
            //           },
            //         },
            //       },
            //     },
            //   },
            // },
            // task_lvl_2: {
            //   select: {
            //     id: true,
            //     task: {
            //       select: {
            //         id: true,
            //         indexTask: {
            //           select: {
            //             id: true,
            //             workArea: {
            //               select: {
            //                 id: true,
            //                 name: true,
            //                 project: {
            //                   select: {
            //                     id: true,
            //                     name: true,
            //                     description: true,
            //                     CUI: true,
            //                   },
            //                 },
            //               },
            //             },
            //           },
            //         },
            //       },
            //     },
            //   },
            // },
            // task_lvl_3: {
            //   select: {
            //     id: true,
            //     task_2: {
            //       select: {
            //         id: true,
            //         task: {
            //           select: {
            //             id: true,
            //             indexTask: {
            //               select: {
            //                 id: true,
            //                 workArea: {
            //                   select: {
            //                     id: true,
            //                     name: true,
            //                     project: {
            //                       select: {
            //                         id: true,
            //                         name: true,
            //                         description: true,
            //                         CUI: true,
            //                       },
            //                     },
            //                   },
            //                 },
            //               },
            //             },
            //           },
            //         },
            //       },
            //     },
            //   },
            // },
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
      },
    });
    if (!reportList) new AppError('no se pudo encontrar los registros', 404);
    const newReport = reportList.map(({ ...data }) => {
      let project;
      // let workArea;
      // if (subtask.indexTask) {
      //   project = subtask.indexTask.workArea.project;
      //   // workArea = subtask.indexTask.workArea;
      // }
      // if (subtask.task) {
      //   project = subtask.task.indexTask.workArea.project;
      //   // workArea = subtask.task.indexTask.workArea;
      // }
      // if (subtask.task_lvl_2) {
      //   project = subtask.task_lvl_2.task.indexTask.workArea.project;
      //   // workArea = subtask.task_lvl_2.task.indexTask.workArea;
      // }
      // if (subtask.task_lvl_3) {
      //   project = subtask.task_lvl_3.task_2.task.indexTask.workArea.project;
      //   // workArea = subtask.task_lvl_3.task_2.task.indexTask.workArea;
      // }
      return { ...data, subtask: [], project };
    });
    const newReportByList = projectList.map(project => {
      // const subtasks = newReport.filter(
      //   subtask => subtask.project?.id === project.id
      // );
      // const newSubTask = subtasks.map(({ project, ...a }) => ({
      //   ...a,
      //   // liquidation: a.status === 'LIQUIDATION' ? 30 : 100,
      // }));

      return { ...project, subtasks: [] };
    });
    const filterProjects = newReportByList.filter(
      project => project.subtasks.length !== 0
    );
    // return filterProjects;
    return { user, subtask: filterProjects };
  }
  static async getSubTasksByProyect(projectId: Projects['id']) {
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
  static async index(id: Projects['id']) {
    if (!id) throw new AppError('No se pudo encontrar el proyecto', 404);
    const getIndex = await prisma.projects.findUnique({
      where: { id },
      select: {
        CUI: true,
        name: true,
        description: true,
        startDate: true,
        untilDate: true,
        moderator: {
          select: { profile: { select: { firstName: true, lastName: true } } },
        },
        areas: {
          select: {
            id: true,
            item: true,
            name: true,
            indexTasks: {
              select: {
                id: true,
                item: true,
                name: true,
                // subTasks: {
                //   select: {
                //     id: true,
                //     item: true,
                //     name: true,
                //   },
                // },
                tasks: {
                  select: {
                    id: true,
                    item: true,
                    name: true,
                    // subTasks: {
                    //   select: {
                    //     id: true,
                    //     item: true,
                    //     name: true,
                    //   },
                    // },
                    tasks_2: {
                      select: {
                        id: true,
                        item: true,
                        name: true,
                        // subTasks: {
                        //   select: {
                        //     id: true,
                        //     item: true,
                        //     name: true,
                        //   },
                        // },
                        tasks_3: {
                          select: {
                            id: true,
                            item: true,
                            name: true,
                            // subTasks: {
                            //   select: {
                            //     id: true,
                            //     item: true,
                            //     name: true,
                            //   },
                            // },
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
    return getIndex;
  }
}
export default ReportsServices;
