import AppError from '../utils/appError';
import { Duty, prisma } from '../utils/prisma.server';
interface DutyMember {
  id?: number;
  position?: string;
  fullName: string;
  progress?: string;
  lastMeeting?: Date;
  futureMeeting?: Date;
  status: string;
  request?: string;
}

interface Data {
  CUI: string;
  project: string;
  asitec?: string;
  feedback?: string;
  listId: number;
  members: DutyMember[];
}

class DutyServices {
  static async create(data: Data) {
    const { CUI, project, asitec, feedback, listId, members } = data;
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    const duty = await prisma.duty.create({
      data: {
        CUI,
        project,
        asitec,
        feedback,
        listId,
      },
    });
    await prisma.dutyMembers.createMany({
      data: members.map(memberData => ({
        position: memberData.position,
        fullName: memberData.fullName,
        progress: memberData.progress,
        lastMeeting: memberData.lastMeeting
          ? new Date(memberData.lastMeeting)
          : null,
        futureMeeting: memberData.futureMeeting
          ? new Date(memberData.futureMeeting)
          : null,
        status: memberData.status,
        request: memberData.request,
        dutyId: duty.id,
      })),
    });
    return duty;
  }
  static async update(id: Duty['id'], data: Data) {
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    const { CUI, project, asitec, feedback, listId, members } = data;
    const duty = await prisma.duty.update({
      where: { id },
      data: {
        CUI,
        project,
        asitec,
        feedback,
        listId,
      },
      include: {
        members: true,
      },
    });
    await prisma.dutyMembers.updateMany({
      data: members.map(memberData => ({
        where: { id: memberData.id },
        data: {
          position: memberData.position,
          fullName: memberData.fullName,
          progress: memberData.progress,
          lastMeeting: memberData.lastMeeting
            ? new Date(memberData.lastMeeting)
            : null,
          futureMeeting: memberData.futureMeeting
            ? new Date(memberData.futureMeeting)
            : null,
          status: memberData.status,
          request: memberData.request,
        },
      })),
    });
    return duty;
  }
  static async delete(id: Duty['id']) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    await prisma.duty.delete({ where: { id } });
    return 'ok';
  }
}
export default DutyServices;
