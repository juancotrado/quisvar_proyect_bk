import {
  showUsers,
  createUser,
  deleteUser,
  updateUser,
  showUser,
  showTaskByUser,
  showSubTasksByUser,
} from './users.controllers';
import { login, recoverPassword } from './auth.controllers';

// updateTaskStatus,
// assignedTask,

// showWorkareas,

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
  // updateStatusPDF,
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

import { generateIndex, showListReportByUser } from './reports.controllers';
import { createFeedback, findFeedbacks } from './feedbacks.controllers';
import {
  addNewStage,
  duplicateLevels,
  duplicateProject,
  duplicateStages,
} from './duplicates.controllers';
import {
  createStage,
  deleteStage,
  showListStages,
  showStage,
  updateStage,
} from './stages.controllers';
import {
  createSector,
  deleteSector,
  showSectors,
  updateSector,
} from './sector.controllers';
import {
  createTypeSpeciality,
  deleteTypeSpeciality,
  showTypeSpecialities,
  showTypeSpeciality,
  updateTypeSpeciality,
} from './typeSpecialities.controllers';
import {
  createLevel,
  deleteLevel,
  showLevel,
  updateLevel,
} from './levels.controllers';
import {
  createReportByUser,
  showReportsBySupervisor,
} from './humanResource.controllers';
import {
  createList,
  updateList,
  userAttendance,
  updateAttendance,
  getListById,
  getAllListByDate,
} from './list.controller';
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
export { login, recoverPassword };
export {
  showSpecialities,
  createSpeciality,
  deleteSpeciality,
  showSpeciality,
  updateSpeciality,
};

//Project Controllers
export {
  showProjects,
  showProject,
  deleteProject,
  createProject,
  updateProject,
};

//Subtask Controllers
export {
  showSubTask,
  createSubTask,
  deleteSubTasks,
  updateSubTask,
  assignedSubTask,
  updateStatusSubTask,
  // updateStatusPDF,
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
export { duplicateProject, duplicateLevels };

//Stages Controllers
export {
  showListStages,
  createStage,
  updateStage,
  deleteStage,
  showStage,
  addNewStage,
  duplicateStages,
};
//Sector Controllers
export { showSectors, createSector, updateSector, deleteSector };

//TypeSpeciality Controllers
export {
  showTypeSpeciality,
  createTypeSpeciality,
  updateTypeSpeciality,
  deleteTypeSpeciality,
  showTypeSpecialities,
};

//levels Controllers
export { createLevel, updateLevel, deleteLevel, showLevel };

//human Resource Controllers
export { createReportByUser, showReportsBySupervisor };

//List Controllers
export {
  createList,
  updateList,
  userAttendance,
  updateAttendance,
  getListById,
  getAllListByDate,
};
