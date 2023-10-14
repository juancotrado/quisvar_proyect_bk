import AppError from '../utils/appError';
import { Companies, prisma } from '../utils/prisma.server';

class CompaniesServices {
  static async createCompany(data: Companies) {
    if (!data) throw new AppError(`No hay datos`, 400);
    const newCompany = await prisma.companies.create({
      data: {
        ...data,
        inscription: new Date(data.inscription ?? ''),
        activities: new Date(data.activities ?? ''),
        SEE: new Date(data.activities ?? ''),
      },
    });
    return newCompany;
  }
  static async getCompanies() {
    const companies = await prisma.companies.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return companies;
  }
  static async getCompaniesById(id: Companies['id']) {
    const companies = await prisma.companies.findFirst({
      where: { id },
    });
    return companies;
  }
}
export default CompaniesServices;
