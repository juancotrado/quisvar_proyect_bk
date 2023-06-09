import { _dirPath } from '.';
import AppError from '../utils/appError';
import { prisma } from '../utils/prisma.server';

class PathServices {
  static async pathProject(id: number) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const project = await prisma.projects.findFirst({ where: { id } });
    if (!project)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const path = _dirPath + '/' + project.name;
    return path;
  }
  static async pathArea(id: number) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const area = await prisma.workAreas.findFirst({
      where: { id },
      select: { name: true, item: true, project: { select: { name: true } } },
    });
    if (!area)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const projectPath = _dirPath + '/' + area.project.name;
    const areaPath = '/' + area.item + '.' + area.name;
    const path = projectPath + areaPath;
    return path;
  }
  static async pathIndexTask(id: number) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const task = await prisma.indexTasks.findFirst({
      where: { id },
      select: {
        name: true,
        item: true,
        workArea: {
          select: {
            item: true,
            name: true,
            project: { select: { name: true } },
          },
        },
      },
    });
    if (!task)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const projectPath = _dirPath + '/' + task.workArea.project.name;
    const areaPath = '/' + task.workArea.item + '.' + task.workArea.name;
    const indexTaskPath = '/' + task.item + '.' + task.name;
    const path = projectPath + areaPath + indexTaskPath;
    return path;
  }
  static async pathTask(id: number) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const task = await prisma.tasks.findFirst({
      where: { id },
      select: {
        name: true,
        item: true,
        indexTask: {
          select: {
            name: true,
            item: true,
            workArea: {
              select: {
                item: true,
                name: true,
                project: { select: { name: true } },
              },
            },
          },
        },
      },
    });
    if (!task)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const projectPath = _dirPath + '/' + task.indexTask.workArea.project.name;
    const areaPath =
      '/' + task.indexTask.workArea.item + '.' + task.indexTask.workArea.name;
    const indexTaskPath = '/' + task.indexTask.item + '.' + task.indexTask.name;
    const taskPath = '/' + task.item + '.' + task.name;
    const path = projectPath + areaPath + indexTaskPath + taskPath;
    return path;
  }
}

export default PathServices;
