import { prisma } from '../utils/prisma.server';

class UsersServices {
   static async getUsers() {
    try {
      const users = await prisma.users.findMany({
        orderBy: { profile: { firstName: 'asc' } }, include: { profile: true}
      });
      return users;
      
    } catch (error) {
      throw error;
    }
  }
}
export default UsersServices;
