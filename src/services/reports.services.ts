import AppError from '../utils/appError';
import { Projects, Users, prisma } from '../utils/prisma.server';
import Queries from '../utils/queries';
import { DEGREE_DATA, round2Decimal, roundTwoDecimail } from '../utils/tools';
import StageServices from './stages.services';

class ReportsServices {
  static async getReportByUser(
    userId: Users['id'],
    initialDate: Date,
    untilDate: Date,
    status: 'DONE' | 'LIQUIDATION'
  ) {
    if (!userId) throw new AppError('Oops!, ID invalido', 400);
    const GMT = 60 * 60 * 1000;
    //----------------------- Time to 000Z --------------------------
    const _startDate = new Date(initialDate).getTime();
    const _endDate = new Date(untilDate).getTime();
    const startOfDay = new Date(_startDate + GMT * 5);
    const endOfDay = new Date(_endDate + GMT * 29 - 1);
    /*---------------------- User Details ------------------------------------
      This section deals with user information and details.
    */
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
    if (!user) throw new AppError('Oops!, ID invalido', 400);
    /*------------------------ Get user degree ----------------------------------
      This section deals show user details on attendance.
    */
    const findDegreeUser = DEGREE_DATA.find(({ values }) =>
      values.some(({ value }) => value === user.profile?.degree)
    );
    /*------------------------ User Attendance ----------------------------------
      This section deals show user details on attendance.
    */
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
    /* --------------------------- Subtasks by User ------------------------------
      This section, user tasks are filtered based on their status, start date,
      and until date.
    */
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
            name: true,
            // feedBacks: true,
            users: true,
            Levels: {
              select: {
                stages: {
                  select: {
                    name: true,
                    bachelorCost: true,
                    professionalCost: true,
                    moderator: Queries.selectProfileShort,
                    project: {
                      select: {
                        id: true,
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
    /* ---------------------- Project List ----------------------------------------
     This section details the list of existing projects
    */
    const getProjectIds = reportList.map(
      ({ subtask }) => subtask.Levels.stages.project.id
    );
    const projectIdList = [...new Set(getProjectIds)];
    const projectList = await prisma.projects.findMany({
      where: { id: { in: projectIdList } },
      select: {
        id: true,
        name: true,
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
    /* ---------------------- Transform Data by Price per Role ----------------------
      This section transforms the given data by accumulating prices for each bachelor
      or professional role.
    */
    const newReport = reportList.map(({ subtask, ...data }) => {
      const { stages } = subtask.Levels;
      const { project, bachelorCost, professionalCost } = stages;
      //------------------------ Calculate pricing per degree --------------------------
      const degreePrice =
        findDegreeUser?.degree == 'bachelor'
          ? bachelorCost
          : findDegreeUser?.degree === 'professional'
          ? professionalCost
          : 0;
      //------------------------ Add pricing per degree --------------------------
      const price = subtask.days * round2Decimal(degreePrice);
      const stayPrice = round2Decimal(StageServices.estadia);
      const totalPrice = roundTwoDecimail(price + stayPrice);
      const pricing = { price, stayPrice, totalPrice };
      //------------------------------------------------------------------------
      return { ...data, ...pricing, ...subtask, project };
    });
    /* ---------------------- Parsing Subtask per Projects ----------------------------------------
     This section details the list of existing subtask by projects
    */
    const projects = projectList.map(({ id, ..._project }) => {
      const subtasksList = newReport.filter(({ project }) => project.id === id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const subtasks = subtasksList.map(({ project, ...sub }) => ({ ...sub }));
      return { ..._project, subtasks };
    });
    // const projects = newReportByList.filter(
    //   project => project.subtasks.length !== 0
    // );
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
