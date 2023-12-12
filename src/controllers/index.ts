import {
  showUsers,
  createUser,
  deleteUser,
  updateUser,
  showUser,
  showTaskByUser,
  showSubTasksByUser,
} from './users.controllers';
import AuthController from './auth.controllers';

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
  updateTypeItem,
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
  createVoucher,
  declineVoucher,
  doneMessage,
  quantityFiles,
  showMessage,
  showMessages,
  updateMessage,
} from './mail.controllers';
import {
  createLicense,
  expiredLicenses,
  getLicenseById,
  getLicensesByStatus,
  getLicensesEmployee,
  updateLicense,
} from './licenses.controllers';
import {
  createCompany,
  getCompaniesById,
  getCompany,
} from './companies.controller';
import {
  createSpecialist,
  getSpecialist,
  getSpecialistByDNI,
  getSpecialistById,
} from './specialist.controller';
import {
  createAreaSpecialty,
  deleteAreaSpecialty,
  getAreaSpecialty,
  uploadAreaSpecialty,
} from './areaSpecialty.controller';
import {
  createTrainingSpecialty,
  deleteTrainingSpecialty,
  getTrainingSpecialty,
  updateTrainingSpecialty,
} from './trainingSpecialty.controller';
import {
  createAreaSpecialtyList,
  deleteAreaSpecialtyList,
  getAreaSpecialtyList,
  updateAreaSpecialtyList,
} from './areaSpecialtyList.controller';
import {
  createTrainingSpecialtyList,
  getTrainingSpecialtyList,
} from './trainingSpecialtyList.controllers';
import {
  createWorkStation,
  getWorkStation,
  updateWorkStation,
  deleteWorkStation,
} from './workStation.controllers';
import {
  createEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
} from './equipment.controller';
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
export { createLevel, updateLevel, deleteLevel, showLevel, updateTypeItem };

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
  createVoucher,
  declineVoucher,
};
//Licenses Controllers
export {
  createLicense,
  updateLicense,
  getLicenseById,
  getLicensesByStatus,
  getLicensesEmployee,
  expiredLicenses,
};
//Companies Controllers
export { createCompany, getCompany, getCompaniesById };
//Specialists Controllers
export {
  createSpecialist,
  getSpecialist,
  getSpecialistByDNI,
  getSpecialistById,
};
//Area Specialty Controllers
export {
  createAreaSpecialty,
  getAreaSpecialty,
  uploadAreaSpecialty,
  deleteAreaSpecialty,
};
//Area Specialty List Controllers
export {
  createAreaSpecialtyList,
  getAreaSpecialtyList,
  updateAreaSpecialtyList,
  deleteAreaSpecialtyList,
};
//Training Specialty Controllers
export {
  createTrainingSpecialty,
  getTrainingSpecialty,
  updateTrainingSpecialty,
  deleteTrainingSpecialty,
};
//Training Specialty List Controllers
export { createTrainingSpecialtyList, getTrainingSpecialtyList };
//WorkStation Controller
export {
  createWorkStation,
  getWorkStation,
  updateWorkStation,
  deleteWorkStation,
};
//Equipment Controller
export { createEquipment, getEquipment, updateEquipment, deleteEquipment };

export { AuthController };
