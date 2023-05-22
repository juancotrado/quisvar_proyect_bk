import {
  showUsers,
  createUser,
  deleteUser,
  updateUser,
  showUser,
  showTaskByUser,
} from './users.controllers';
import { login } from './auth.controllers';
import { showIndexTask } from './indextasks.controllers';
// createTask,
// updateTaskStatus,
// deleteTasks,
// assignedTask,
// updateTask,
import { showTask } from './tasks.controllers';
// showWorkareas,
// deleteWorkarea,
// createWorkArea,
// updateWorkarea,
import { showWorkArea } from './workareas.controllers';
// deleteProject,
// showProjects,
// createProject,
// updateProject,
import { showProject } from './projects.controllers';
// import {
//   showSubTask,
//   createSubTask,
//   deleteSubTasks,
//   updateSubTask,
// } from './subtasks.controllers';
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
  showWorkArea,
  // showWorkareas,
  // deleteWorkarea,
  // createWorkArea,
  // updateWorkarea,
};
// //Project Controllers
export {
  // showProjects,
  showProject,
  // deleteProject,
  // createProject,
  // updateProject,
};
//IndexTask Controllers
export { showIndexTask };
//Task Controllers
export {
  showTask,
  // createTask,
  // updateTaskStatus,
  // deleteTasks,
  // assignedTask,
  // updateTask,
};

//Subtask Controllers
// export { showSubTask, createSubTask, deleteSubTasks, updateSubTask };
