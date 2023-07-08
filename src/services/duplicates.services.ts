import AppError from '../utils/appError';
import { Projects, prisma } from '../utils/prisma.server';
import PathServices from './paths.services';

class DuplicatesServices {
  static async duplicateSubTask(
    idOld: number,
    idNew: number,
    type: 'indexTaskId' | 'taskId' | 'task_2_Id' | 'task_3_Id'
  ) {
    const listSubtasks = await prisma.subTasks.findMany({
      where: { [type]: idOld },
      select: {
        id: true,
        hours: true,
        item: true,
        name: true,
        price: true,
        files: {
          where: {
            AND: [
              { type: 'MATERIAL' },
              // { type: 'SUCCESSFUL' }
            ],
          },
        },
      },
    });
    const newListSubTasks = listSubtasks.map(data => {
      const { files, id, ..._data } = data;
      return { [type]: idNew, ..._data };
    });
    const newSubTaks = await prisma.subTasks.createMany({
      data: newListSubTasks,
    });
    const getIdSubTaks = await prisma.subTasks.findMany({
      where: { [type]: idNew },
      select: { id: true, item: true },
    });
    if (listSubtasks.length > 0) {
      listSubtasks.forEach(async subtask => {
        const findSubTask = getIdSubTaks.filter(s => s.item == subtask.item);
        const _subtask_id = findSubTask[0].id;
        if (subtask.files.length > 0) {
          const newFiles = await Promise.all(
            subtask.files.map(async file => {
              const { dir, ...data } = file;
              if (file.type === 'MATERIAL') {
                const newDir = await PathServices.pathSubTask(
                  _subtask_id,
                  file.type
                );
                return { dir: newDir, ...data };
              }
              return file;
            })
          );
          await prisma.files.createMany({ data: newFiles });
        }
      });
    }
    return newSubTaks;
  }
  static async proyect(id: Projects['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const getProyect = await prisma.projects.findUnique({
      where: { id },
      select: {
        name: true,
        description: true,
        untilDate: true,
        userId: true,
        startDate: true,
        typeSpeciality: true,
        unique: true,
        specialityId: true,
        CUI: true,
      },
    });
    if (!getProyect)
      throw new AppError(
        'No se pudo encontrar el proyecto para duplicado',
        404
      );

    const { ..._project } = getProyect;
    const newProject = { ..._project, name: _project.name + '(copia)' };
    const createProject = await prisma.projects.create({
      data: newProject,
    });
    if (!createProject)
      throw new AppError('No se pudo Duplicar el proyecto', 400);

    const getAreas = await prisma.workAreas.findMany({
      where: { projectId: id },
      select: {
        id: true,
        item: true,
        name: true,
        userId: true,
        indexTasks: { select: { item: true, name: true, unique: true } },
      },
    });
    const awas = getAreas.map(area => {
      const { indexTasks, id, ...data } = area;
      return { projectId: createProject.id, ...data };
    });
    await prisma.workAreas.createMany({ data: awas });
    const getIdAreas = await prisma.workAreas.findMany({
      where: { projectId: createProject.id },
      select: { id: true, item: true },
    });
    getAreas.forEach(async area => {
      const findArea = getIdAreas.filter(a => a.item == area.item);
      const getIndexTasks = await prisma.indexTasks.findMany({
        where: { workAreaId: area.id },
        orderBy: { id: 'asc' },
        select: { item: true, name: true, id: true, unique: true },
      });
      const awas2 = getIndexTasks.map(index => {
        const { id, ...data } = index;
        return { workAreaId: findArea[0].id, ...data };
      });
      await prisma.indexTasks.createMany({ data: awas2 });
      const getIdIndexAreas = await prisma.indexTasks.findMany({
        where: { workAreaId: findArea[0].id },
        select: { id: true, item: true },
      });
      getIndexTasks.forEach(async indexTask => {
        const findIndexTask = getIdIndexAreas.filter(
          a => a.item == indexTask.item
        );
        //***********************SUBTAKS******************* */
        await this.duplicateSubTask(
          indexTask.id,
          findIndexTask[0].id,
          'indexTaskId'
        );
        //**************************************************** */
        const getTasks = await prisma.tasks.findMany({
          where: { indexTaskId: indexTask.id },
          orderBy: { id: 'asc' },
          select: { item: true, name: true, id: true, unique: true },
        });
        const awas3 = getTasks.map(task => {
          const { id, ...data } = task;
          return { indexTaskId: findIndexTask[0].id, ...data };
        });
        await prisma.tasks.createMany({ data: awas3 });
        const getIdTaks = await prisma.tasks.findMany({
          where: { indexTaskId: findIndexTask[0].id },
          select: { id: true, item: true },
        });
        getTasks.forEach(async task => {
          const findTask = getIdTaks.filter(a => a.item == task.item);
          //***********************SUBTAKS******************* */
          await this.duplicateSubTask(task.id, findTask[0].id, 'taskId');
          //**************************************************** */
          const getTasks2 = await prisma.task_lvl_2.findMany({
            where: { taskId: task.id },
            orderBy: { id: 'asc' },
            select: { item: true, name: true, id: true, unique: true },
          });
          const awas4 = getTasks2.map(task2 => {
            const { id, ...data } = task2;
            return { taskId: findTask[0].id, ...data };
          });
          await prisma.task_lvl_2.createMany({ data: awas4 });
          const getIdTasks2 = await prisma.task_lvl_2.findMany({
            where: { taskId: findTask[0].id },
            select: { id: true, item: true },
          });
          getTasks2.forEach(async task2 => {
            const findTask2 = getIdTasks2.filter(a => a.item == task2.item);
            //***********************SUBTAKS******************* */
            await this.duplicateSubTask(task2.id, findTask2[0].id, 'task_2_Id');
            //**************************************************** */
            const getTasks3 = await prisma.task_lvl_3.findMany({
              where: { task_2_Id: task2.id },
              orderBy: { id: 'asc' },
              select: { item: true, name: true, id: true, unique: true },
            });
            const awas5 = getTasks3.map(task3 => {
              const { id, ...data } = task3;
              return { task_2_Id: findTask2[0].id, ...data };
            });
            await prisma.task_lvl_3.createMany({ data: awas5 });
            const getIdTasks3 = await prisma.task_lvl_3.findMany({
              where: { task_2_Id: findTask2[0].id },
              select: { id: true, item: true },
            });
            getTasks3.forEach(async task3 => {
              const findTask3 = getIdTasks3.filter(a => a.item == task3.item);
              //***********************SUBTAKS******************* */
              await this.duplicateSubTask(
                task3.id,
                findTask3[0].id,
                'task_3_Id'
              );
              //**************************************************** */
            });
          });
        });
      });
    });

    return { oldName: getProyect.name, ...createProject };
  }
}

export default DuplicatesServices;
