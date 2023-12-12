import { Profiles, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
class ProfileServices {
  static async update(
    id: Users['id'],
    {
      firstName,
      lastName,
      phone,
      dni,
      degree,
      job,
      description,
      department,
      district,
      province,
      addressRef,
      firstNameRef,
      lastNameRef,
      phoneRef,
      room,
      userPc,
    }: Profiles,
    email: Users['email'],
    address: Users['address'],
    ruc: Users['ruc']
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateUser = await prisma.users.update({
      where: { id },
      data: {
        email,
        address,
        ruc,
        profile: {
          update: {
            firstName,
            lastName,
            phone,
            dni,
            degree,
            job,
            description,
            department,
            district,
            province,
            addressRef,
            firstNameRef,
            lastNameRef,
            phoneRef,
            room,
            userPc,
          },
        },
      },
    });
    return updateUser;
  }
}

export default ProfileServices;
