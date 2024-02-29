import { ContractForm } from 'types/types';
import {
  Companies,
  Consortium,
  Contratc,
  prisma,
} from '../utils/prisma.server';
import AppError from '../utils/appError';
import { existsSync, mkdirSync, rmdirSync } from 'fs';
import { _contractPath } from '.';
import Queries from '../utils/queries';

class ContractServices {
  public static async showAll(
    startsWith?: string,
    companyId?: Companies['id'],
    consortiumId?: Consortium['id'],
    date?: string
  ) {
    if (
      (companyId && isNaN(companyId)) ||
      (consortiumId && isNaN(consortiumId))
    )
      throw new AppError('Opps, id Invalida', 400);
    const lteDate = (date && new Date(date)) || undefined;
    const showContract = await prisma.contratc.findMany({
      where: {
        cui: { startsWith },
        createdAt: { lte: lteDate },
        companyId,
        consortiumId,
      },
      orderBy: [{ createdAt: 'asc' }, { contractNumber: 'asc' }],
      select: Queries.selectContract.select,
    });
    return showContract;
  }

  public static async show(id: Contratc['id']) {
    if (!id) throw new AppError('Opps, id Invalida', 400);
    const showContract = await prisma.contratc.findUnique({ where: { id } });
    if (!showContract)
      throw new AppError('No existe información del contrato', 404);
    return showContract;
  }

  public static async create(data: ContractForm) {
    const createContract = await prisma.contratc.create({
      data,
    });
    if (createContract) mkdirSync(`${_contractPath}/${createContract.id}`);
    return createContract;
  }

  public static async update(
    id: Contratc['id'],
    data: Omit<ContractForm, 'companyId' | 'consortiumId'>
  ) {
    if (!id) throw new AppError('Opps, id Invalida', 400);
    const createContract = await prisma.contratc.update({
      where: { id },
      data,
    });
    return createContract;
  }

  public static async delete(id: Contratc['id']) {
    if (!id) throw new AppError('Opps, id Invalida', 400);
    const findContract = await prisma.contratc.findUnique({ where: { id } });
    if (!findContract)
      throw new AppError('No se puede encontrar el contrato', 404);
    const removePath = `${_contractPath}/${findContract.id}`;
    if (!existsSync(removePath))
      throw new AppError('No se puede elimiar el contrato', 404);
    const deleteContract = await prisma.contratc.delete({ where: { id } });
    rmdirSync(removePath);
    return deleteContract;
  }

  public static async updateDetails(id: Contratc['id'], details: string) {
    if (!id) throw new AppError('Opps, id Invalida', 400);
    const updateDetails = await prisma.contratc.update({
      where: { id },
      data: { details },
    });
    return updateDetails;
  }
  public static async updatePhases(
    id: Contratc['id'],
    phases: Contratc['phases']
  ) {
    if (!id) throw new AppError('Opps, id Invalida', 400);
    const updateDetails = await prisma.contratc.update({
      where: { id },
      data: { phases },
    });
    return updateDetails;
  }

  public static async updateIndex(id: Contratc['id'], indexContract: string) {
    if (!id) throw new AppError('Opps, id Invalida', 400);
    const updateIndex = await prisma.contratc.update({
      where: { id },
      data: { indexContract },
    });
    return updateIndex;
  }
}
export default ContractServices;
