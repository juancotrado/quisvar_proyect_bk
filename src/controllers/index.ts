import {
  showUsers,
  createUser,
  deleteUser,
  updateUser,
  showUser,
  showTaskByUser,
  showSubTasksByUser,
} from './users.controllers';

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
  activeLicenses,
  createFreeForAll,
  createLicense,
  deleteLicense,
  expiredLicenses,
  getLicenseById,
  getLicensesByStatus,
  getLicensesEmployee,
  getLicensesFee,
  updateLicense,
} from './licenses.controllers';
import CompanyController, {
  createCompany,
  getCompaniesById,
  getCompany,
  updateCompaniesById,
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

import {
  createConsortium,
  getAllConsortium,
  getConsortiumById,
  updateById,
  deleteById,
  getBoth,
  deleteImg,
  updateImg,
  createRelationConsortium,
  deleteRelationConsortium,
} from './consortium.controller';
import {
  createGroup,
  getAll,
  getById,
  updateGroup,
  deleteGroup,
  createRelation,
  updateRelation,
  deleteRelation,
  deleteMod,
} from './groups.controller';
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
export { addNewStage, duplicateStages };
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
  createFreeForAll,
  updateLicense,
  getLicenseById,
  getLicensesByStatus,
  getLicensesEmployee,
  getLicensesFee,
  activeLicenses,
  expiredLicenses,
  deleteLicense,
};
//Companies Controllers
export {
  createCompany,
  getCompany,
  getCompaniesById,
  updateCompaniesById,
  CompanyController,
};
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

//Consortium Controller
export {
  createConsortium,
  getAllConsortium,
  getConsortiumById,
  updateById,
  deleteById,
  getBoth,
  updateImg,
  deleteImg,
  createRelationConsortium,
  deleteRelationConsortium,
};
//Groups Controller
export {
  createGroup,
  getAll,
  getById,
  updateGroup,
  deleteGroup,
  createRelation,
  updateRelation,
  deleteRelation,
  deleteMod,
};

export { default as ContractController } from './contract.controllers';
export { default as PayMailControllers } from './paymail.controllers';
export { default as AuthController } from './auth.controllers';
export { default as StagesControllers } from './stages.controllers';
export { default as AttendanceGroupControllers } from './attendanceGroup.controller';
export { default as DutyControllers } from './duty.controllers';
export { default as SubtaskControllers } from './subtasks.controllers';
