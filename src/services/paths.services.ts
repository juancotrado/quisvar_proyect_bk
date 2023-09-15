import { StageParse } from 'types/types';
import { _dirPath, _materialPath, _reviewPath } from '.';
import AppError from '../utils/appError';
import { parsePath, parseProjectName } from '../utils/fileSystem';
import { Files, SubTasks, prisma } from '../utils/prisma.server';

class StageInfo {
  static async findProject(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const project = await prisma.projects.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
    if (!project)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    return project;
  }

  static async findArea(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const area = await prisma.workAreas.findUnique({
      where: { id },
      select: {
        name: true,
        item: true,
        projectId: true,
      },
    });
    if (!area)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const project = await this.findProject(area.projectId);
    const projectPath = await PathServices.pathProject(area.projectId);
    return { ...area, project, projectPath };
  }

  static async findIndexTask(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const index_task = await prisma.indexTasks.findUnique({
      where: { id },
      select: {
        name: true,
        item: true,
        workAreaId: true,
      },
    });
    if (!index_task)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const area = await this.findArea(index_task.workAreaId);
    const areaPath = await PathServices.pathArea(index_task.workAreaId);
    return { ...index_task, area, areaPath };
  }

  static async findTask(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const task = await prisma.tasks.findUnique({
      where: { id },
      select: {
        name: true,
        item: true,
        indexTaskId: true,
      },
    });
    if (!task)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const indexTask = await this.findIndexTask(task.indexTaskId);
    const indexTaskPath = await PathServices.pathIndexTask(task.indexTaskId);
    return { ...task, indexTask, indexTaskPath };
  }

  static async findTask_2(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const task_2 = await prisma.task_lvl_2.findUnique({
      where: { id },
      select: {
        name: true,
        item: true,
        taskId: true,
      },
    });
    if (!task_2)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const task = await this.findTask(task_2.taskId);
    const taskPath = await PathServices.pathTask(task_2.taskId);
    return { ...task_2, task, taskPath };
  }

  static async findTask_3(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const task_3 = await prisma.task_lvl_3.findUnique({
      where: { id },
      select: {
        name: true,
        item: true,
        task_2_Id: true,
      },
    });
    if (!task_3)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const task_2 = await this.findTask_2(task_3.task_2_Id);
    const task_2Path = await PathServices.pathTask2(task_2.taskId);
    return { ...task_3, task_2, task_2Path };
  }
  static async findSubTask(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const subTask = await prisma.subTasks.findUnique({
      where: { id },
    });
    if (!subTask)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const { item, name, status } = subTask;

    // return { id, item, name, rootPathTask: '' };
    throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
  }
}

class PathServices {
  static async pathProject(id: number) {
    const { name } = await StageInfo.findProject(id);
    return _dirPath + '/';
  }

  static async pathArea(id: number) {
    const { item, name, projectPath } = await StageInfo.findArea(id);
    const areaPath = parsePath(item, name);
    return projectPath + areaPath;
  }

  static async pathIndexTask(id: number) {
    const { item, name, areaPath } = await StageInfo.findIndexTask(id);
    const indexTaskPath = parsePath(item, name);
    return areaPath + indexTaskPath;
  }

  static async pathTask(id: number) {
    const { item, name, indexTaskPath } = await StageInfo.findTask(id);
    const taskPath = parsePath(item, name);
    return indexTaskPath + taskPath;
  }

  static async pathTask2(id: number) {
    const { item, name, taskPath } = await StageInfo.findTask_2(id);
    const task_2Path = parsePath(item, name);
    return taskPath + task_2Path;
  }

  static async pathTask3(id: number) {
    const { item, name, task_2Path } = await StageInfo.findTask_3(id);
    const task_3Path = parsePath(item, name);
    return task_2Path + task_3Path;
  }

  static async pathSubTask(id: SubTasks['id'], type: Files['type']) {
    const rootPathTask = await StageInfo.findSubTask(id);
    const projectDir = rootPathTask;
    // .split('/').at(3);
    if (type === 'MATERIAL') return _materialPath + '/' + projectDir;
    if (type === 'REVIEW') return _reviewPath + '/' + projectDir;
    return rootPathTask;
  }
}

export default PathServices;
