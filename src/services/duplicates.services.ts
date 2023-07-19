import { copyFile, copyFileSync, mkdir, mkdirSync } from 'fs';
import AppError from '../utils/appError';
import {
  IndexTasks,
  Projects,
  Stages,
  Task_lvl_2,
  Task_lvl_3,
  Tasks,
  WorkAreas,
  prisma,
} from '../utils/prisma.server';
import PathServices from './paths.services';

class DuplicatesServices {
  static async project(id: Projects['id'], newStageId?: Stages['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const getProyect = await prisma.projects.findUnique({
      where: { id },
      select: {
        name: true,
        description: true,
        location: true,
        untilDate: true,
        userId: true,
        startDate: true,
        typeSpeciality: true,
        unique: true,
        specialityId: true,
        CUI: true,
        stageId: true,
        groupId: true,
        stage: {
          select: { name: true },
        },
      },
    });
    if (!getProyect)
      throw new AppError(
        'No se pudo encontrar el proyecto para duplicado',
        404
      );
    const { stage, groupId, ..._project } = getProyect;
    let newProject = {
      ..._project,
      name: _project.name + '(copia)',
    };
    if (newStageId) {
      newProject = {
        ..._project,
        stageId: newStageId,
        name: _project.name + newStageId,
      };
    }
    const createProject = await prisma.projects.create({
      data: newProject,
      include: { stage: { select: { name: true } } },
    });
    if (newStageId) {
      await prisma.projects.update({
        where: { id: createProject.id },
        data: { groupId },
      });
    } else {
      await prisma.projects.update({
        where: { id: createProject.id },
        data: { group: { create: { name: createProject.name } } },
      });
    }
    if (!createProject)
      throw new AppError('No se pudo Duplicar el proyecto', 400);
    // await this.duplicateArea(id, createProject.id);
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

    return {
      oldName: stage ? getProyect.name + '-' + stage.name : getProyect.name,
      newName: createProject.stage
        ? createProject.name + '-' + createProject.stage.name
        : createProject.name,
      ...createProject,
    };
  }
  static async area(id: WorkAreas['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const getAreas = await prisma.workAreas.findUnique({
      where: { id },
      select: {
        item: true,
        name: true,
        userId: true,
        projectId: true,
      },
    });
    if (!getAreas)
      throw new AppError('No se pudo encontrar el area para duplicado', 404);
    const quantityAreas = await prisma.workAreas.count({
      where: { projectId: getAreas.projectId },
    });
    const newArea = {
      ...getAreas,
      item: `${quantityAreas + 1}`,
      name: getAreas.name + '(copia)',
    };
    const createNewArea = await prisma.workAreas.create({ data: newArea });
    if (!createNewArea) throw new AppError('No se pudo Duplicar el área', 400);
    await this.duplicateIndexTask(id, createNewArea.id, newArea.item);
    return { oldName: getAreas.name, ...createNewArea };
  }
  static async indexTask(id: IndexTasks['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const getIndexTask = await prisma.indexTasks.findUnique({
      where: { id },
      select: {
        item: true,
        name: true,
        unique: true,
        workAreaId: true,
      },
    });
    if (!getIndexTask)
      throw new AppError(
        'No se pudo encontrar el indice de tarea para duplicado',
        404
      );
    const quantityIndexTasks = await prisma.indexTasks.count({
      where: { workAreaId: getIndexTask.workAreaId },
    });
    const newIndexTask = {
      ...getIndexTask,
      item: getIndexTask.item.slice(0, -1) + (quantityIndexTasks + 1),
      name: getIndexTask.name + '(copia)',
    };
    const createNewIndexTask = await prisma.indexTasks.create({
      data: newIndexTask,
    });
    if (!createNewIndexTask)
      throw new AppError('No se pudo Duplicar el área', 400);
    await this.duplicateSubTask(
      id,
      createNewIndexTask.id,
      'indexTaskId',
      newIndexTask.item
    );
    await this.duplicateTask(id, createNewIndexTask.id, newIndexTask.item);
    return { oldName: getIndexTask.name, ...createNewIndexTask };
  }
  static async task(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const getTask = await prisma.tasks.findUnique({
      where: { id },
      select: {
        item: true,
        name: true,
        unique: true,
        indexTaskId: true,
      },
    });
    if (!getTask)
      throw new AppError(
        'No se pudo encontrar el indice de tarea para duplicado',
        404
      );
    const quantityTasks = await prisma.tasks.count({
      where: { indexTaskId: getTask.indexTaskId },
    });
    const newTask = {
      ...getTask,
      item: getTask.item.slice(0, -1) + (quantityTasks + 1),
      name: getTask.name + '(copia)',
    };
    const createNewTask = await prisma.tasks.create({
      data: newTask,
    });
    if (!createNewTask) throw new AppError('No se pudo Duplicar la tarea', 400);
    await this.duplicateSubTask(id, createNewTask.id, 'taskId', newTask.item);
    await this.duplicateTask2(id, createNewTask.id, newTask.item);
    return { oldName: newTask.name, ...createNewTask };
  }
  static async task2(id: Task_lvl_2['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const getTask2 = await prisma.task_lvl_2.findUnique({
      where: { id },
      select: {
        item: true,
        name: true,
        unique: true,
        taskId: true,
      },
    });
    if (!getTask2)
      throw new AppError(
        'No se pudo encontrar el indice de tarea 2 para duplicado',
        404
      );
    const quantityTasks2 = await prisma.task_lvl_2.count({
      where: { taskId: getTask2.taskId },
    });
    const newTask2 = {
      ...getTask2,
      item: getTask2.item.slice(0, -1) + (quantityTasks2 + 1),
      name: getTask2.name + '(copia)',
    };
    const createNewTask2 = await prisma.task_lvl_2.create({
      data: newTask2,
    });
    if (!createNewTask2)
      throw new AppError('No se pudo Duplicar la tarea 2', 400);
    await this.duplicateSubTask(
      id,
      createNewTask2.id,
      'task_2_Id',
      newTask2.item
    );
    await this.duplicateTask3(id, createNewTask2.id, newTask2.item);
    return { oldName: newTask2.name, ...createNewTask2 };
  }
  static async task3(id: Task_lvl_3['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const getTask3 = await prisma.task_lvl_3.findUnique({
      where: { id },
      select: {
        item: true,
        name: true,
        unique: true,
        task_2_Id: true,
      },
    });
    if (!getTask3)
      throw new AppError(
        'No se pudo encontrar el indice de tarea 2 para duplicado',
        404
      );
    const quantityTasks3 = await prisma.task_lvl_3.count({
      where: { task_2_Id: getTask3.task_2_Id },
    });
    const newTask3 = {
      ...getTask3,
      item: getTask3.item.slice(0, -1) + (quantityTasks3 + 1),
      name: getTask3.name + '(copia)',
    };
    const createNewTask3 = await prisma.task_lvl_3.create({
      data: newTask3,
    });
    if (!createNewTask3)
      throw new AppError('No se pudo Duplicar la tarea 2', 400);
    await this.duplicateSubTask(
      id,
      createNewTask3.id,
      'task_3_Id',
      createNewTask3.item
    );
    // await this.duplicateTask2(id, createNewTask3.id, newTask3.item);
    return { oldName: newTask3.name, ...createNewTask3 };
  }
  static async duplicateArea(idOrigin: number, idNew: number) {
    const getAreas = await prisma.workAreas.findMany({
      where: { projectId: idOrigin },
      select: {
        id: true,
        item: true,
        name: true,
        userId: true,
        indexTasks: { select: { item: true, name: true, unique: true } },
      },
    });
    const newListAreas = getAreas.map(area => {
      const { indexTasks, id, ...data } = area;
      return { projectId: idNew, ...data };
    });
    await prisma.workAreas.createMany({ data: newListAreas });
    const getIdAreas = await prisma.workAreas.findMany({
      where: { projectId: idNew },
      select: { id: true, item: true },
    });
    getAreas.forEach(async area => {
      const findArea = getIdAreas.filter(a => a.item == area.item);
      await this.duplicateIndexTask(area.id, findArea[0].id, findArea[0].item);
    });
  }
  static async duplicateIndexTask(
    idOrigin: number,
    idNew: number,
    itemArea?: string
  ) {
    const getIndexTasks = await prisma.indexTasks.findMany({
      where: { workAreaId: idOrigin },
      orderBy: { id: 'asc' },
      select: { item: true, name: true, id: true, unique: true },
    });
    const newListIndexTask = getIndexTasks.map(index => {
      const { id, item, ...data } = index;
      const newItem = itemArea ? itemArea + item.slice(-2) : item;
      return { workAreaId: idNew, item: newItem, ...data };
    });
    await prisma.indexTasks.createMany({ data: newListIndexTask });
    const getIdIndexAreas = await prisma.indexTasks.findMany({
      where: { workAreaId: idNew },
      select: { id: true, item: true },
    });

    getIndexTasks.forEach(async indexTask => {
      const findIndexTask = getIdIndexAreas.filter(
        a => a.item.slice(-1) == indexTask.item.slice(-1)
      );
      const _path = await PathServices.pathIndexTask(findIndexTask[0].id);
      if (_path) mkdirSync(_path);
      await this.duplicateSubTask(
        indexTask.id,
        findIndexTask[0].id,
        'indexTaskId'
      );
      await this.duplicateTask(
        indexTask.id,
        findIndexTask[0].id,
        findIndexTask[0].item
      );
    });
  }
  static async duplicateTask(
    idOrigin: number,
    idNew: number,
    itemIndexTask?: string
  ) {
    const getTasks = await prisma.tasks.findMany({
      where: { indexTaskId: idOrigin },
      orderBy: { id: 'asc' },
      select: { item: true, name: true, id: true, unique: true },
    });
    const newTaskList = getTasks.map(task => {
      const { id, item, ...data } = task;
      const newItem = itemIndexTask ? itemIndexTask + item.slice(-2) : item;
      return { indexTaskId: idNew, item: newItem, ...data };
    });
    await prisma.tasks.createMany({ data: newTaskList });
    const getIdTaks = await prisma.tasks.findMany({
      where: { indexTaskId: idNew },
      select: { id: true, item: true },
    });
    getTasks.forEach(async task => {
      const findTask = getIdTaks.filter(
        a => a.item.slice(-1) == task.item.slice(-1)
      );
      const _path = await PathServices.pathTask(findTask[0].id);
      if (_path) mkdirSync(_path);
      await this.duplicateSubTask(task.id, findTask[0].id, 'taskId');
      await this.duplicateTask2(task.id, findTask[0].id, findTask[0].item);
    });
  }
  static async duplicateTask2(
    task_Old: number,
    task_New: number,
    itemTask?: string
  ) {
    const getTasks2 = await prisma.task_lvl_2.findMany({
      where: { taskId: task_Old },
      orderBy: { id: 'asc' },
      select: { item: true, name: true, id: true, unique: true },
    });
    const newListTask2 = getTasks2.map(task2 => {
      const { id, item, ...data } = task2;
      const newItem = itemTask ? itemTask + item.slice(-2) : item;
      return { taskId: task_New, item: newItem, ...data };
    });
    await prisma.task_lvl_2.createMany({ data: newListTask2 });
    const getIdTasks2 = await prisma.task_lvl_2.findMany({
      where: { taskId: task_New },
      select: { id: true, item: true },
    });
    getTasks2.forEach(async task2 => {
      const findTask2 = getIdTasks2.filter(
        a => a.item.slice(-1) == task2.item.slice(-1)
      );
      const _path = await PathServices.pathTask2(findTask2[0].id);
      if (_path) mkdirSync(_path);
      await this.duplicateSubTask(task2.id, findTask2[0].id, 'task_2_Id');
      await this.duplicateTask3(task2.id, findTask2[0].id, findTask2[0].item);
    });
  }
  static async duplicateTask3(
    task_2_Id_Old: number,
    task_2_Id_New: number,
    itemTask2?: string
  ) {
    const getTasks3 = await prisma.task_lvl_3.findMany({
      where: { task_2_Id: task_2_Id_Old },
      orderBy: { id: 'asc' },
      select: { item: true, name: true, id: true, unique: true },
    });
    const newListTask3 = getTasks3.map(task3 => {
      const { id, item, ...data } = task3;
      const newItem = itemTask2 ? itemTask2 + item.slice(-2) : item;
      return { task_2_Id: task_2_Id_New, item: newItem, ...data };
    });
    // const pathList = await Promise.all(
    //   getTasks3.map(async _task3 => {
    //     const path = await PathServices.pathTask3(_task3.id);
    //     return path;
    //   })
    // );
    await prisma.task_lvl_3.createMany({ data: newListTask3 });
    const getIdTasks3 = await prisma.task_lvl_3.findMany({
      where: { task_2_Id: task_2_Id_New },
      select: { id: true, item: true },
    });
    getTasks3.forEach(async task3 => {
      const findTask3 = getIdTasks3.filter(
        a => a.item.slice(-1) == task3.item.slice(-1)
      );
      const _path = await PathServices.pathTask3(findTask3[0].id);
      if (_path) mkdirSync(_path);
      await this.duplicateSubTask(
        task3.id,
        findTask3[0].id,
        'task_3_Id',
        itemTask2
      );
    });
  }
  static async duplicateSubTask(
    idOld: number,
    idNew: number,
    type: 'indexTaskId' | 'taskId' | 'task_2_Id' | 'task_3_Id',
    itemTask?: string
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
      const { files, id, item, ..._data } = data;
      const newItem = itemTask ? itemTask + item.slice(-2) : item;
      return { [type]: idNew, item: newItem, ..._data };
    });
    const newSubTaks = await prisma.subTasks.createMany({
      data: newListSubTasks,
    });
    const getIdSubTaks = await prisma.subTasks.findMany({
      where: { [type]: idNew },
      select: { id: true, item: true },
    });
    if (listSubtasks.length !== 0) {
      listSubtasks.forEach(async subtask => {
        const findSubTask = getIdSubTaks.filter(
          s => s.item.slice(-1) == subtask.item.slice(-1)
        );
        const _subtask_id = findSubTask[0].id;
        if (subtask.files.length !== 0) {
          const newFiles = await Promise.all(
            subtask.files.map(async file => {
              const { dir, id, subTasksId, name, ...data } = file;
              const newName = itemTask
                ? name.replace(subtask.item.slice(0, -2), itemTask)
                : name;
              if (file.type === 'MATERIAL') {
                const newDir = await PathServices.pathSubTask(
                  _subtask_id,
                  file.type
                );
                copyFileSync(`${dir}/${name}`, `${newDir}/${newName}`);
                return {
                  dir: newDir,
                  subTasksId: _subtask_id,
                  name: newName,
                  ...data,
                };
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
}

export default DuplicatesServices;
