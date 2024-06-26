import { unlinkSync } from 'fs';
import AppError from '../utils/appError';
import { Companies, prisma } from '../utils/prisma.server';
import { PickCompanyInvoice } from 'types/types';

class CompaniesServices {
  static async createCompany(data: Companies) {
    if (!data) throw new AppError(`No hay datos`, 400);

    const newCompany = await prisma.companies.create({
      data: {
        ...data,
        inscription: data.inscription ? new Date(data.inscription) : null,
        activities: data.activities ? new Date(data.activities) : null,
        SEE: data.SEE ? new Date(data.SEE) : null,
      },
    });
    return newCompany;
  }
  static async getCompanies() {
    const companies = await prisma.companies.findMany({
      orderBy: { name: 'desc' },
    });
    return companies;
  }
  static async getCompaniesById(id: Companies['id']) {
    const companies = await prisma.companies.findFirst({
      where: { id },
    });
    return companies;
  }
  static async updateCompaniesById(id: Companies['id'], data: Companies) {
    const companies = await prisma.companies.update({
      where: { id },
      data: {
        ...data,
        inscription: data.inscription ? new Date(data.inscription) : null,
        activities: data.activities ? new Date(data.activities) : null,
        SEE: data.SEE ? new Date(data.SEE) : null,
      },
    });
    return companies;
  }
  static async updateCompanieInvoiceById({
    color,
    email,
    id,
    phone,
  }: PickCompanyInvoice) {
    if (!id) throw new AppError(`Asegúrese de enviar los datos correctos`, 401);

    const companies = await prisma.companies.update({
      where: { id },
      data: {
        color,
        email,
        phone,
      },
    });
    return companies;
  }
  //COMPANIES IMG
  public static async updateImg(img: Companies['img'], id: Companies['id']) {
    if (!id) throw new AppError(`Oops!, id no encontrado`, 400);
    const consortiums = await prisma.companies.update({
      where: { id },
      data: { img },
    });
    return consortiums;
  }

  public static async deleteImg(id: Companies['id']) {
    if (!id) throw new AppError(`Oops!, id no encontrado`, 400);
    const res = await prisma.companies.findUnique({
      where: { id },
      select: {
        img: true,
      },
    });
    if (res?.img) unlinkSync(`public/img/companies/${res.img}`);
    const consortiums = await prisma.companies.update({
      where: { id },
      data: {
        img: null,
      },
    });
    return consortiums;
  }
}
export default CompaniesServices;
