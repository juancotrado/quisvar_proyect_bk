import { ContractForm } from 'types/types';
import { Contratc, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class ContractServices {
  public static async showAll() {
    const showContract = await prisma.contratc.findMany();
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
    return createContract;
  }

  public static async update(id: Contratc['id'], data: ContractForm) {
    if (!id) throw new AppError('Opps, id Invalida', 400);
    const createContract = await prisma.contratc.update({
      where: { id },
      data,
    });
    return createContract;
  }

  public static async delete(id: Contratc['id']) {
    if (!id) throw new AppError('Opps, id Invalida', 400);
    const deleteContract = await prisma.contratc.delete({ where: { id } });
    return deleteContract;
  }
}
export default ContractServices;
