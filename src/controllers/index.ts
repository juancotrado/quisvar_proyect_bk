import {
  showUsers,
  createUser,
  deleteUser,
  updateUser,
  showUser,
} from './users.controllers';
import { login } from './auth.controllers';
import {
  showTask,
  createTask,
  updateTaskStatus,
  deleteTasks,
} from './tasks.controllers';
import {
  showWorkareas,
  deleteWorkarea,
  showWorkArea,
  updateWorkarea,
} from './workareas.controllers';
import {
  deleteProject,
  showProject,
  showProjects,
} from './projects.controllers';
export { showTask, createTask, updateTaskStatus, deleteTasks };
export { showUsers, createUser, deleteUser, updateUser, showUser };
export { showWorkareas, deleteWorkarea, showWorkArea, updateWorkarea };
// export { showTask, showTasks, deleteTasks, updateTask, createTask };
export { login };
// export { showTasks };
export { showProjects, showProject, deleteProject };
