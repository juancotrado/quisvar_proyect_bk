import { Profiles, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class ProfileServices {
  static async update(
    userId: Users['id'],
    { firstName, lastName, phone }: Profiles
  ) {
    if (!userId) throw new AppError('Oops!,Invalid ID', 400);
    const updateProfile = await prisma.profiles.update({
      where: {
        userId,
      },
      data: { firstName, lastName, phone },
    });
    return updateProfile;
  }
}

export default ProfileServices;
