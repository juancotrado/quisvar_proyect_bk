import { _dirPath, _materialPath, _reviewPath } from '.';
import AppError from '../utils/appError';
import { parsePath } from '../utils/fileSystem';
import { Files, SubTasks, prisma } from '../utils/prisma.server';

class PathServices {
  static async pathProject(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const project = await prisma.projects.findUnique({
      where: { id },
      include: { stage: { select: { id: true, name: true } } },
    });
    if (!project)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const projectName = project.stage
      ? project.name + '-' + project.stage.name
      : project.name;
    const path = _dirPath + '/' + projectName;
    return path;
  }
  static async pathArea(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const area = await prisma.workAreas.findUnique({
      where: { id },
      select: {
        name: true,
        item: true,
        project: {
          select: {
            name: true,
            unique: true,
            stage: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!area)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const projectName = area.project.stage
      ? area.project.name + '-' + area.project.stage.name
      : area.project.name;
    const projectPath = _dirPath + '/' + projectName;
    let areaPath = '/' + area.item + '.' + area.name;
    if (area.project.unique) areaPath = '/' + area.name;
    const path = projectPath + areaPath;
    return path;
  }
  static async pathIndexTask(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const task = await prisma.indexTasks.findUnique({
      where: { id },
      select: {
        name: true,
        item: true,
        workArea: {
          select: {
            item: true,
            name: true,
            project: {
              select: {
                name: true,
                unique: true,
                stage: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!task)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const projectName = task.workArea.project.stage
      ? task.workArea.project.name + '-' + task.workArea.project.stage.name
      : task.workArea.project.name;
    const projectPath = _dirPath + '/' + projectName;
    let areaPath = '/' + task.workArea.item + '.' + task.workArea.name;
    if (task.workArea.project.unique) areaPath = '/' + task.workArea.name;
    const indexTaskPath = '/' + task.item + '.' + task.name;
    const path = projectPath + areaPath + indexTaskPath;
    return path;
  }
  static async pathTask(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
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
                project: {
                  select: {
                    name: true,
                    unique: true,
                    stage: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!task)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const projectName = task.indexTask.workArea.project.stage
      ? task.indexTask.workArea.project.name +
        '-' +
        task.indexTask.workArea.project.stage.name
      : task.indexTask.workArea.project.name;
    const projectPath = _dirPath + '/' + projectName;
    let areaPath =
      '/' + task.indexTask.workArea.item + '.' + task.indexTask.workArea.name;
    if (task.indexTask.workArea.project.unique)
      areaPath = '/' + task.indexTask.workArea.name;
    const indexTaskPath = '/' + task.indexTask.item + '.' + task.indexTask.name;
    const taskPath = '/' + task.item + '.' + task.name;
    const path = projectPath + areaPath + indexTaskPath + taskPath;
    return path;
  }

  static async pathTask2(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const task_2 = await prisma.task_lvl_2.findUnique({
      where: { id },
      select: {
        name: true,
        item: true,
        task: {
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
                    project: {
                      select: {
                        name: true,
                        unique: true,
                        stage: { select: { id: true, name: true } },
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
    if (!task_2)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const { task } = task_2;
    const { indexTask } = task;
    const { workArea } = indexTask;
    const { project } = workArea;
    const projectName = project.stage
      ? project.name + '-' + project.stage.name
      : project.name;
    const projectPath = _dirPath + '/' + projectName;
    let areaPath = parsePath(workArea.item, workArea.name);
    if (project.unique) areaPath = '/' + workArea.name;
    const indexTaskPath = parsePath(indexTask.item, indexTask.name);
    const taskPath = parsePath(task.item, task.name);
    const task_2Path = parsePath(task_2.item, task_2.name);
    const path = projectPath + areaPath + indexTaskPath + taskPath + task_2Path;
    return path;
  }

  static async pathTask3(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const task_3 = await prisma.task_lvl_3.findUnique({
      where: { id },
      select: {
        name: true,
        item: true,
        task_2: {
          select: {
            name: true,
            item: true,
            task: {
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
                        project: {
                          select: {
                            name: true,
                            unique: true,
                            stage: { select: { id: true, name: true } },
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
    if (!task_3)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    const { task_2 } = task_3;
    const { task } = task_2;
    const { indexTask } = task;
    const { workArea } = indexTask;
    const { project } = workArea;
    const projectName = project.stage
      ? project.name + '-' + project.stage.name
      : project.name;
    const projectPath = _dirPath + '/' + projectName;
    let areaPath = parsePath(workArea.item, workArea.name);
    if (project.unique) areaPath = '/' + workArea.name;
    const indexTaskPath = parsePath(indexTask.item, indexTask.name);
    const taskPath = parsePath(task.item, task.name);
    const task_2Path = parsePath(task_2.item, task_2.name);
    const task_3Path = parsePath(task_3.item, task_3.name);
    const path =
      projectPath +
      areaPath +
      indexTaskPath +
      taskPath +
      task_2Path +
      task_3Path;
    return path;
  }

  static async pathSubTask(id: SubTasks['id'], type: Files['type']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const subTask = await prisma.subTasks.findUnique({
      where: { id },
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
                project: {
                  select: {
                    name: true,
                    unique: true,
                    stage: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
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
                    project: {
                      select: {
                        name: true,
                        unique: true,
                        stage: { select: { id: true, name: true } },
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
            name: true,
            item: true,
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
                        project: {
                          select: {
                            name: true,
                            unique: true,
                            stage: { select: { id: true, name: true } },
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
            item: true,
            name: true,
            task_2: {
              select: {
                name: true,
                item: true,
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
                            project: {
                              select: {
                                name: true,
                                unique: true,
                                stage: { select: { id: true, name: true } },
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
    if (!subTask) throw new AppError('No existe la subtarea', 404);
    if (subTask.indexTask) {
      const { indexTask } = subTask;
      const { workArea } = indexTask;
      const { project } = workArea;
      const projectName = project.stage
        ? project.name + '-' + project.stage.name
        : project.name;
      const pathProject = _dirPath + '/' + projectName;
      const areaPath = parsePath(workArea.item, workArea.name);
      const indexTaskPath = parsePath(indexTask.item, indexTask.name);
      // const subTaskPath = parsePath(subTask.item, subTask.name);
      const path = pathProject + areaPath + indexTaskPath;
      if (type === 'MATERIAL') return _materialPath + '/' + project.name;
      if (type === 'REVIEW') return _reviewPath + '/' + project.name;
      return path;
    }
    if (subTask.task) {
      const { task } = subTask;
      const { indexTask } = task;
      const { workArea } = indexTask;
      const { project } = workArea;

      const projectName = project.stage
        ? project.name + '-' + project.stage.name
        : project.name;
      const pathProject = _dirPath + '/' + projectName;
      let areaPath = parsePath(workArea.item, workArea.name);
      if (project.unique) areaPath = '/' + workArea.name;
      const indexTaskPath = parsePath(indexTask.item, indexTask.name);
      const taskPath = parsePath(task.item, task.name);

      const path = pathProject + areaPath + indexTaskPath + taskPath;
      if (type === 'MATERIAL') return _materialPath + '/' + project.name;
      if (type === 'REVIEW') return _reviewPath + '/' + project.name;
      return path;
    }
    if (subTask.task_lvl_2) {
      const { task_lvl_2 } = subTask;
      const { task } = task_lvl_2;
      const { indexTask } = task;
      const { workArea } = indexTask;
      const { project } = workArea;

      const projectName = project.stage
        ? project.name + '-' + project.stage.name
        : project.name;
      const pathProject = _dirPath + '/' + projectName;
      let areaPath = parsePath(workArea.item, workArea.name);
      if (project.unique) areaPath = '/' + workArea.name;
      const indexTaskPath = parsePath(indexTask.item, indexTask.name);
      const taskPath = parsePath(task.item, task.name);
      const taskLvl2Path = parsePath(task_lvl_2.item, task_lvl_2.name);

      const path =
        pathProject + areaPath + indexTaskPath + taskPath + taskLvl2Path;
      if (type === 'MATERIAL') return _materialPath + '/' + project.name;
      if (type === 'REVIEW') return _reviewPath + '/' + project.name;
      return path;
    }
    if (subTask.task_lvl_3) {
      const { task_lvl_3 } = subTask;
      const { task_2 } = task_lvl_3;
      const { task } = task_2;
      const { indexTask } = task;
      const { workArea } = indexTask;
      const { project } = workArea;

      const projectName = project.stage
        ? project.name + '-' + project.stage.name
        : project.name;
      const pathProject = _dirPath + '/' + projectName;
      let areaPath = parsePath(workArea.item, workArea.name);
      if (project.unique) areaPath = '/' + workArea.name;
      const indexTaskPath = parsePath(indexTask.item, indexTask.name);
      const taskPath = parsePath(task.item, task.name);
      const taskLvl2Path = parsePath(task_2.item, task_2.name);
      const taskLvl3Path = parsePath(task_lvl_3.item, task_lvl_3.name);

      const path =
        pathProject +
        areaPath +
        indexTaskPath +
        taskPath +
        taskLvl2Path +
        taskLvl3Path;
      if (type === 'MATERIAL') return _materialPath + '/' + project.name;
      if (type === 'REVIEW') return _reviewPath + '/' + project.name;
      return path;
    }
    throw new AppError('No se pudo encontrar la ruta', 404);
  }
}

export default PathServices;
