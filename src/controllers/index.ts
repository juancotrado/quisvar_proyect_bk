import {
  showUsers,
  createUser,
  deleteUser,
  updateUser,
  showUser,
  showTaskByUser,
} from './users.controllers';
import { login } from './auth.controllers';
import {
  showTask,
  createTask,
  updateTaskStatus,
  deleteTasks,
  assignedTask,
  updateTask,
} from './tasks.controllers';
import {
  showWorkareas,
  deleteWorkarea,
  showWorkArea,
  createWorkArea,
  updateWorkarea,
} from './workareas.controllers';
import {
  deleteProject,
  showProject,
  showProjects,
  createProject,
  updateProject,
} from './projects.controllers';
import {
  showSubTask,
  createSubTask,
  deleteSubTasks,
  updateSubTask,
} from './subtasks.controllers';
// User Controllers
export {
  showUsers,
  createUser,
  deleteUser,
  updateUser,
  showUser,
  showTaskByUser,
};
//Auth Controllers
export { login };
//WorkAreas Controllers
export {
  showWorkareas,
  deleteWorkarea,
  showWorkArea,
  createWorkArea,
  updateWorkarea,
};
//Project Controllers
export {
  showProjects,
  showProject,
  deleteProject,
  createProject,
  updateProject,
};
//Task Controllers
export {
  showTask,
  createTask,
  updateTaskStatus,
  deleteTasks,
  assignedTask,
  updateTask,
};

//Subtask Controllers
export { showSubTask, createSubTask, deleteSubTasks, updateSubTask };
