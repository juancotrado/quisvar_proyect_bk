import {
  showUsers,
  createUser,
  deleteUser,
  updateUser,
  showUser,
  showTaskByUser,
  showSubTasksByUser,
} from './users.controllers';
import { login } from './auth.controllers';
import {
  createIndexTask,
  deleteIndexTasks,
  showIndexTask,
  updatIndexTask,
} from './indextasks.controllers';
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
  showReviewList,
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
  assignedSubTask,
  updateStatusSubTask,
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
import { deleteFile, uploadFile } from './files.controllers';
// User Controllers
export {
  showUsers,
  createUser,
  deleteUser,
  updateUser,
  showUser,
  showTaskByUser,
  showSubTasksByUser,
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
  showReviewList,
};
//Project Controllers
export {
  showProjects,
  showProject,
  deleteProject,
  createProject,
  updateProject,
};
//IndexTask Controllers
export { showIndexTask, deleteIndexTasks, createIndexTask, updatIndexTask };
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
export {
  showSubTask,
  createSubTask,
  deleteSubTasks,
  updateSubTask,
  assignedSubTask,
  updateStatusSubTask,
};
//Profile Controllers
export { showProfile, downloadProfile, updateProfile };

//Files Controllers
export { uploadFile, deleteFile };
