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
  showSubtasksByIndexTask,
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
  updateStatusPDF,
  updatePercentage,
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
import { deleteFile, uploadFile, uploadFiles } from './files.controllers';
import {
  createTaskLvl_2,
  deleteTaskLvl_2,
  updateTaskLvl_2,
} from './task_2.controllers';
import {
  createTaskLvl_3,
  deleteTaskLvl_3,
  updateTaskLvl_3,
} from './task_3.controllers';
import { generateIndex, showListReportByUser } from './reports.controllers';
import { createFeedback, findFeedbacks } from './feedbacks.controllers';
import {
  duplicateArea,
  duplicateIndexTask,
  duplicateProject,
  duplicateTask,
  duplicateTask2,
  duplicateTask3,
} from './duplicates.controllers';
import { showListStages } from './stages.controllers';
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
export {
  showIndexTask,
  deleteIndexTasks,
  createIndexTask,
  updatIndexTask,
  showSubtasksByIndexTask,
};
//Task Controllers
export { showTask, createTask, deleteTasks, updateTask };
//Task Lvl2 Controllers
export { createTaskLvl_2, updateTaskLvl_2, deleteTaskLvl_2 };
//Task Lvl3 Controllers
export { createTaskLvl_3, updateTaskLvl_3, deleteTaskLvl_3 };

//Subtask Controllers
export {
  showSubTask,
  createSubTask,
  deleteSubTasks,
  updateSubTask,
  assignedSubTask,
  updateStatusSubTask,
  updateStatusPDF,
  updatePercentage,
};
//Profile Controllers
export { showProfile, downloadProfile, updateProfile };

//Files Controllers
export { uploadFile, deleteFile, uploadFiles };

//Reports Controllers
export { showListReportByUser, generateIndex };

//FeedBack Controllers
export { createFeedback, findFeedbacks };

//Duplicates Controllers
export {
  duplicateProject,
  duplicateArea,
  duplicateIndexTask,
  duplicateTask,
  duplicateTask2,
  duplicateTask3,
};

//Stages Controllers
export { showListStages };
