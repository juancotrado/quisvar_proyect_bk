import AppError from '../utils/appError';
import { Duty, prisma } from '../utils/prisma.server';
import GroupServices from './groups.services';

class DutyServices {
  static async create(data: Duty, groupId: number, contractId: number) {
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    const duty = await prisma.duty.create({
      data: {
        ...data,
      },
    });
    const userTask = await GroupServices.getUserTask(groupId, contractId);
    userTask.map(async tasks => {
      const dutyMembers = await prisma.dutyMembers.create({
        data: {
          position: tasks.user?.job,
          fullName: tasks.user?.firstName + ' ' + tasks.user?.lastName,
          dutyId: duty.id,
        },
        select: {
          id: true,
        },
      });
      tasks.subtasks.map(async task => {
        await prisma.dutyTasks.create({
          data: {
            name: task ? task.name : '',
            percentage: task ? +task.percentage : 0,
            dutyMemberId: dutyMembers.id,
          },
        });
      });
    });

    return duty;
  }
  static async update(id: Duty['id'], data: Duty) {
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    await prisma.duty.update({
      where: { id },
      data: {
        ...data,
      },
      include: {
        members: true,
      },
    });

    return 'ok';
  }
  static async delete(id: Duty['id']) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    await prisma.duty.delete({ where: { id } });
    return 'ok';
  }
  //Duty projects
  static async getProjects() {
    // if (!cui) throw new AppError(`Oops!, algo salio mal`, 400);
    const projects = await prisma.contratc.findMany({
      select: { id: true, cui: true, projectName: true },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return projects;
  }
  // static async getProject(cui: Contratc['cui']) {
  //   if (!cui) throw new AppError(`Oops!, algo salio mal`, 400);
  //   await prisma.contratc.findFirst({ where: { cui } });
  //   return 'ok';
  // }
}
export default DutyServices;
