import { Profiles, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { userPickEdit } from '../utils/format.server';
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
      gender,
    }: Profiles,

    { email, address, ruc, roleId }: userPickEdit
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateUser = await prisma.users.update({
      where: { id },
      data: {
        email,
        address,
        ruc,
        roleId,
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
            gender,
          },
        },
      },
    });
    return updateUser;
  }
}

export default ProfileServices;
