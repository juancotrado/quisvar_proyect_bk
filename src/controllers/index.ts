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

import { showListReportByUser } from './reports.controllers';
import { createFeedback, findFeedbacks } from './feedbacks.controllers';
import {
  addNewStage,
  duplicateLevels,
  duplicateProject,
  duplicateStages,
  duplicateSubtask,
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
  createList,
  updateList,
  userAttendance,
  updateAttendance,
  getListById,
  getAllListByDate,
  getListRange,
  deleteManyList,
} from './list.controller';
import {
  archivedMessage,
  createMessage,
  createReplyMessage,
  doneMessage,
  quantityFiles,
  showMessage,
  showMessages,
  updateMessage,
} from './mail.controllers';
import {
  createLicense,
  getLicenseById,
  updateLicense,
} from './licenses.controllers';

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
export { showListReportByUser };

//FeedBack Controllers
export { createFeedback, findFeedbacks };

//Duplicates Controllers
export { duplicateProject, duplicateLevels, duplicateSubtask };
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

//List Controllers
export {
  createList,
  updateList,
  userAttendance,
  updateAttendance,
  getListById,
  getAllListByDate,
  getListRange,
  deleteManyList,
};

//Mail Controllers
export {
  showMessages,
  createMessage,
  showMessage,
  quantityFiles,
  createReplyMessage,
  updateMessage,
  archivedMessage,
  doneMessage,
};
//Licenses Controllers
export { createLicense, updateLicense, getLicenseById };
