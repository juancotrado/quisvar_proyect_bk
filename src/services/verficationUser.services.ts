import { prisma } from '../utils/prisma.server';

class verificationUsersServices {
  static async saveToken(token: string, userId: number) {
    const verificationUser = prisma.verificationUser.upsert({
      where: { userId },
      update: {
        token,
      },
      create: {
        token,
        userId,
      },
    });
    return verificationUser;
  }
}
export default verificationUsersServices;
