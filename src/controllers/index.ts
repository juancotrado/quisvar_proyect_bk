import {
  showUsers,
  createUser,
  deleteUser,
  updateUser,
  showUser,
} from './users.controllers';
import { login } from './auth.controllers';
import { showTasks } from './tasks.controllers';

// import // showTask,
// deleteTasks,
// showTasks,
// updateTask,
// createTask,
// './tasks.controllers';
import {
   showWorkareas,
   deleteWorkarea,
  showWorkArea,
 } from './workareas.controllers';
 import {
  showProjects,
  showProject,
 deleteProject,
} from './projects.controllers';
export { showUsers, createUser, deleteUser, updateUser, showUser };
 export { showWorkareas, deleteWorkarea, showWorkArea };
// export { showTask, showTasks, deleteTasks, updateTask, createTask };
export { login };
export { showTasks };
export { showProjects,showProject, deleteProject };
