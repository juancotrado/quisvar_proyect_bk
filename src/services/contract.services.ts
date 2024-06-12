import { ContractForm } from 'types/types';
import {
  Companies,
  Consortium,
  ContractSpecialties,
  Contratc,
  ListSpecialties,
  Specialists,
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
    type?: ContractForm['type'],
    date?: string
  ) {
    if (
      (companyId && isNaN(companyId)) ||
      (consortiumId && isNaN(consortiumId))
    )
      throw new AppError('Opps, id Invalida', 400);
    const gmt_5 = 5 * 60 * 60 * 1000;
    const gte = date ? new Date(new Date(date).getTime() + gmt_5) : undefined;
    const lt = gte ? new Date(new Date(gte).setMonth(12)) : undefined;
    const showContract = await prisma.contratc.findMany({
      where: {
        cui: { startsWith },
        createdAt: { lt, gte },
        companyId,
        consortiumId,
        type,
      },
      orderBy: [{ createdAt: 'asc' }, { contractNumber: 'asc' }],
      select: Queries.selectContract.select,
    });
    return showContract;
  }

  public static async show(id: Contratc['id']) {
    if (!id) throw new AppError('Opps, id Invalida', 400);
    const showContract = await prisma.contratc.findUnique({
      where: { id },
      include: {
        consortium: true,
        company: true,
      },
    });
    if (!showContract)
      throw new AppError('No existe información del contrato', 404);
    return showContract;
  }
  public static async createSpeciality(
    contratcId: Contratc['id'],
    listSpecialtiesId: ListSpecialties['id']
  ) {
    if (!contratcId || !listSpecialtiesId)
      throw new AppError('Opps, id Invalida', 400);
    const contracSpecialties = await prisma.contractSpecialties.create({
      data: {
        contratcId,
        listSpecialtiesId,
      },
      select: {
        id: true,
        listSpecialties: {
          include: {
            areaSpecialtyList: {
              select: {
                specialist: true,
              },
            },
          },
        },
        contratcId: true,
        specialists: true,
      },
    });

    const { listSpecialties } = contracSpecialties;
    const users = listSpecialties.areaSpecialtyList.map(areaSpecialty => {
      const { specialist } = areaSpecialty;
      return {
        label: specialist.firstName + ' ' + specialist.lastName,
        value: String(specialist.id),
        ...specialist,
      };
    });
    return {
      ...contracSpecialties,
      listSpecialties: {
        id: listSpecialties.id,
        name: listSpecialties.name,
        users: users,
      },
    };
  }
  public static async deleteSpecialty(
    contractSpecialtiesId: ContractSpecialties['id']
  ) {
    if (!contractSpecialtiesId) throw new AppError('Opps, id Invalida', 400);
    const deleteContractSpecialties = await prisma.contractSpecialties.delete({
      where: {
        id: contractSpecialtiesId,
      },
    });

    return deleteContractSpecialties;
  }
  public static async addSpecialist(
    contractSpecialtiesId: ContractSpecialties['id'],
    specialistsId: Specialists['id']
  ) {
    if (!contractSpecialtiesId || !specialistsId)
      throw new AppError('Opps, id Invalida', 400);
    const updateContracSpecialties = await prisma.contractSpecialties.update({
      where: {
        id: contractSpecialtiesId,
      },
      data: {
        specialistsId,
      },
    });

    return updateContracSpecialties;
  }
  public static async getSpecialities(contratcId: Contratc['id']) {
    if (!contratcId) throw new AppError('Opps, id Invalida', 400);
    const contracSpecialties = await prisma.contractSpecialties.findMany({
      select: {
        contratcId: true,
        id: true,
        listSpecialties: {
          include: {
            areaSpecialtyList: {
              select: {
                specialist: true,
              },
            },
          },
        },
        specialists: true,
      },
      where: {
        contratcId,
      },
      orderBy: { createdAt: 'asc' },
    });
    const contracSpecialtiesTransform = contracSpecialties.map(contract => {
      const { listSpecialties, specialists, id, contratcId } = contract;
      const users = listSpecialties.areaSpecialtyList.map(areaSpecialty => {
        const { specialist } = areaSpecialty;
        return {
          label: specialist.firstName + ' ' + specialist.lastName,
          value: String(specialist.id),
          ...specialist,
        };
      });
      return {
        id,
        contratcId,
        listSpecialties: {
          id: listSpecialties.id,
          name: listSpecialties.name,
          users: users,
        },
        specialists: specialists,
      };
    });
    return contracSpecialtiesTransform;
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
    const contract = await prisma.contratc.update({
      where: { id },
      data,
      include: {
        project: {
          select: {
            id: true,
          },
        },
      },
    });
    if (contract.project?.id) {
      await prisma.projects.update({
        where: {
          id: contract.project?.id,
        },
        data: {
          name: data.projectShortName,
        },
      });
    }
    return contract;
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
  public static async updateObservations(
    id: Contratc['id'],
    observations: string
  ) {
    if (!id) throw new AppError('Opps, id Invalida', 400);
    const updateObservations = await prisma.contratc.update({
      where: { id },
      data: { observations },
    });
    return updateObservations;
  }

  public static async updatePhases(
    id: Contratc['id'],
    phases: Contratc['phases'],
    isIndependent: string
  ) {
    if (!id) throw new AppError('Opps, id Invalida', 400);
    const updateDetails = await prisma.contratc.update({
      where: { id },
      data: { phases, isIndependent: isIndependent === 'yes' },
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
