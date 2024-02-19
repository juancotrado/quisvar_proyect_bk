import { NextFunction, Request, Response } from 'express';
import { ConsortiumServices } from '../services';
type FilesProps = { [fieldname: string]: Express.Multer.File[] };

export const createConsortium = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { img } = req.files as FilesProps;
    const query = await ConsortiumServices.create({
      ...body,
      img: img ? img[0].filename : '',
    });
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
export const getAllConsortium = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await ConsortiumServices.getAllConsortium();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getConsortiumById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await ConsortiumServices.getConsortiumById(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const query = await ConsortiumServices.updateById(+id, body);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await ConsortiumServices.deleteById(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
//CONSORTIUM IMG
export const updateImg = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { img } = req.files as FilesProps;
    const image = img ? img[0].filename : '';
    const query = await ConsortiumServices.updateImg(image, +id);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteImg = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await ConsortiumServices.deleteImg(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
//GET CONSORTIUM AND COMPANIES
export const getBoth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await ConsortiumServices.getBoth();
    console.log(query);
    res.status(200).json(query);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
//CONSORTIUM RELATION
export const createRelationConsortium = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { companiesId, consortiumId } = req.params;
    const query = await ConsortiumServices.createRelation(
      +companiesId,
      +consortiumId
    );
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteRelationConsortium = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { companiesId, consortiumId } = req.params;
    const query = await ConsortiumServices.deleteRelation(
      +companiesId,
      +consortiumId
    );
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
