import { Profiles, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class ProfileServices {
  static async update(
    id: Users['id'],
    { firstName, lastName, phone, dni }: Profiles,
    email: Users['email']
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateUser = await prisma.users.update({
      where: { id },
      data: {
        email,
        profile: {
          update: {
            firstName,
            lastName,
            phone,
            dni,
          },
        },
      },
    });
    return updateUser;
  }
}

export default ProfileServices;
