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
// updateTaskStatus,
// assignedTask,
import {
  createTask,
  deleteTasks,
  updateTask,
  showTask,
} from './tasks.controllers';
// showWorkareas,
import {
  deleteWorkarea,
  createWorkArea,
  updateWorkarea,
  showWorkArea,
} from './workareas.controllers';
import {
  deleteProject,
  showProjects,
  createProject,
  updateProject,
  showProject,
} from './projects.controllers';
import {
  createSubTask,
  deleteSubTasks,
  updateSubTask,
  showSubTask,
} from './subtasks.controllers';
import {
  showProfile,
  downloadProfile,
  updateProfile,
} from './profile.controllers';
import {
  showSpecialities,
  createSpeciality,
  deleteSpeciality,
  showSpeciality,
  updateSpeciality,
} from './speacialities.controllers';
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
//Specialities Controllers
export {
  showSpecialities,
  createSpeciality,
  deleteSpeciality,
  showSpeciality,
  updateSpeciality,
};

//WorkAreas Controllers
export {
  showWorkArea,
  // showWorkareas,
  deleteWorkarea,
  createWorkArea,
  updateWorkarea,
};
// //Project Controllers
export {
  showProjects,
  showProject,
  deleteProject,
  createProject,
  updateProject,
};
//IndexTask Controllers
export { showIndexTask };
//Task Controllers
export {
  showTask,
  createTask,
  // updateTaskStatus,
  // assignedTask,
  deleteTasks,
  updateTask,
};
//Subtask Controllers
export { showSubTask, createSubTask, deleteSubTasks, updateSubTask };
//Profile Controllers
export { showProfile, downloadProfile, updateProfile };
