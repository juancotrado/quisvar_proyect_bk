import AppError from '../utils/appError';
import { Duty, prisma } from '../utils/prisma.server';

class DutyServices {
  static async create(data: Duty) {
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    const duty = await prisma.duty.create({
      data,
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
