import { ControllerFunction } from 'types/patterns';
import { AttendanceGroupService } from '../services';
import { FilesProps } from 'types/types';

class AttendanceGroupController {
  public getUsersGroup: ControllerFunction = async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const query = await AttendanceGroupService.getUsersGroup(+groupId);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
  //Group List
  public createList: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const { id, date } = req.query;
      const query = await AttendanceGroupService.createList(
        body,
        Number(id),
        date as string
      );
      res.status(200).json(query);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public editTitle: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const query = await AttendanceGroupService.editTitle(+id, title);
      res.status(200).json(query);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public getList: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { date } = req.query;
      const query = await AttendanceGroupService.getList(date as string, +id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
  public getHistory: ControllerFunction = async (req, res, next) => {
    try {
      const { id, startDate, endDate } = req.query;
      const query = await AttendanceGroupService.getHistory(
        +(id as string),
        startDate as string,
        endDate as string
      );
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
  public deleteListAttendance: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = await AttendanceGroupService.deleteList(+id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
  //Group List File
  public updateListFile: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { file } = req.files as FilesProps;
      const doc = file ? file[0].filename : '';
      const query = await AttendanceGroupService.updateListFile(doc, +id);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };
  public deleteListFile: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = await AttendanceGroupService.deleteListFile(+id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
  //Attendance Group
  public createAttendance: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const query = await AttendanceGroupService.create(body);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };
  public updateAttendance: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { body } = req;
      const query = await AttendanceGroupService.update(+id, body);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
  //Disabled Users
  public disabledUser: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const query = await AttendanceGroupService.disabledGroup(+id, status);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
  //Attendance File
  public updateFile: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { file } = req.files as FilesProps;
      const query = await AttendanceGroupService.updateFile(
        +id,
        file[0].filename
      );
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
  public deleteFile: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = await AttendanceGroupService.deleteFile(+id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
}
export default new AttendanceGroupController();
