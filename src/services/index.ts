import UsersServices from './users.services';
import authServices from './auth.services';
import ProjectsServices from './projects.services';
import SubTasksServices from './subtasks.services';
import ProfileServices from './profile.services';
import SpecialitiesServices from './specialities.services';
import PathServices from './paths.services';
import FilesServices from './files.services';
import ReportsServices from './reports.services';
import FeedBackServices from './feedbacks.services';
import DuplicatesServices from './duplicates.services';
import StageServices from './stages.services';
import SectorServices from './sector.services';
import TypeSpecialitiesServices from './typeSpecialities.services';
import LevelsServices from './levels.services';
import ListServices from './list.services';
export {
  UsersServices,
  authServices,
  ProjectsServices,
  SubTasksServices,
  ProfileServices,
  SpecialitiesServices,
  PathServices,
  FilesServices,
  ReportsServices,
  FeedBackServices,
  DuplicatesServices,
  StageServices,
  SectorServices,
  TypeSpecialitiesServices,
  LevelsServices,
  // PathLevelServices,
  ListServices,
};
export const rootPath = './uploads';
export const _dirPath = `${rootPath}/projects`;
export const _materialPath = `${rootPath}/models`;
export const _reviewPath = `${rootPath}/reviews`;
export const _editablePath = `${rootPath}/editables`;
