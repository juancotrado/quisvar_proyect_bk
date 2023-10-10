import AppError from '../utils/appError';
import { Companies, prisma } from '../utils/prisma.server';

class CompaniesServices {
  static async createCompany(data: Companies) {
    if (!data) throw new AppError(`No hay datos`, 400);
    const newCompany = await prisma.companies.create({ data });
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
}
export default CompaniesServices;
