import { _dirPath, _materialPath, _reviewPath } from '.';
import AppError from '../utils/appError';
import { parsePath } from '../utils/fileSystem';
import { Files, SubTasks, prisma } from '../utils/prisma.server';

class PathServices {
  static async pathProject(id: number) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const project = await prisma.projects.findUnique({ where: { id } });
    if (!project)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const path = _dirPath + '/' + project.name;
    return path;
  }
  static async pathArea(id: number) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const area = await prisma.workAreas.findUnique({
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
    const task = await prisma.indexTasks.findUnique({
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
    const task = await prisma.tasks.findUnique({
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
  static async pathSubTask(id: number, type: Files['type']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const subTask = await prisma.subTasks.findUnique({
      where: { id },
      select: {
        item: true,
        name: true,
        task: {
          select: {
            item: true,
            name: true,
            indexTask: {
              select: {
                item: true,
                name: true,
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
        },
        indexTask: {
          select: {
            item: true,
            name: true,
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
    if (subTask && subTask.task) {
      const { task } = subTask;
      const { indexTask } = task;
      const { workArea } = indexTask;
      const { project } = workArea;
      const pathProject = _dirPath + '/' + project.name;
      const areaPath = parsePath(workArea.item, workArea.name);
      const indexTaskPath = parsePath(indexTask.item, indexTask.name);
      const taskPath = parsePath(task.item, task.name);
      // const subTaskPath = parsePath(subTask.item, subTask.name);
      const path = pathProject + areaPath + indexTaskPath + taskPath;
      if (type === 'MATERIAL') return _materialPath + '/' + project.name;
      if (type === 'REVIEW') return _reviewPath + '/' + project.name;
      return path;
    }
    if (subTask && subTask.indexTask) {
      const { indexTask } = subTask;
      const { workArea } = indexTask;
      const { project } = workArea;
      const pathProject = _dirPath + '/' + project.name;
      const areaPath = parsePath(workArea.item, workArea.name);
      const indexTaskPath = parsePath(indexTask.item, indexTask.name);
      // const subTaskPath = parsePath(subTask.item, subTask.name);
      const path = pathProject + areaPath + indexTaskPath;
      if (type === 'MATERIAL') return _materialPath + '/' + project.name;
      if (type === 'REVIEW') return _reviewPath + '/' + project.name;
      return path;
    }
    throw new AppError('No se pudo encontrar la ruta', 404);
  }
}

export default PathServices;
