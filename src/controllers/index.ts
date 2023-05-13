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
export { showTask, createTask, updateTaskStatus, deleteTasks };
import {
  showWorkareas,
  deleteWorkarea,
  showWorkArea,
  updateWorkarea,
} from './workareas.controllers';
export { showUsers, createUser, deleteUser, updateUser, showUser };
export { showWorkareas, deleteWorkarea, showWorkArea, updateWorkarea };
// export { showTask, showTasks, deleteTasks, updateTask, createTask };
export { login };
