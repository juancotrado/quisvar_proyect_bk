import AppError from '../utils/appError';
import { Duty, prisma } from '../utils/prisma.server';
interface DutyMember {
  id?: number;
  position?: string;
  fullName: string;
  progress?: string;
  lastMeeting?: string;
  futureMeeting?: string;
  status: string;
  request?: string;
}

interface Data {
  CUI: string;
  project: string;
  shortName: string;
  titleMeeting?: string;
  dutyGroup?: string;
  asitec?: string;
  feedback?: string;
  listId: number;
  members: DutyMember[];
}

class DutyServices {
  static async create(data: Data) {
    const { CUI, project, listId, shortName, members } = data;
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    const duty = await prisma.duty.create({
      data: {
        CUI,
        project,
        listId,
        shortName,
      },
    });
    await prisma.dutyMembers.createMany({
      data: members.map(memberData => ({
        position: memberData.position ?? '',
        fullName: memberData.fullName,
        progress: memberData.progress ?? '',
        lastMeeting: memberData.lastMeeting ?? '',
        futureMeeting: memberData.futureMeeting ?? '',
        status: memberData.status ?? '',
        request: memberData.request ?? '',
        dutyId: duty.id,
      })),
    });
    return duty;
  }
  static async update(id: Duty['id'], data: Data) {
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    const { CUI, project, listId, members } = data;
    await prisma.duty.update({
      where: { id },
      data: {
        CUI,
        project,
        listId,
      },
      include: {
        members: true,
      },
    });
    members.forEach(async member => {
      await prisma.dutyMembers.update({
        where: {
          id: member.id,
        },
        data: {
          position: member.position ?? '',
          fullName: member.fullName,
        },
      });
    });
    // await prisma.dutyMembers.updateMany({
    //   data: members.map(memberData => ({
    //     where: { id: memberData.id },
    //     data: {
    //       position: memberData.position,
    //       fullName: memberData.fullName,
    //       progress: memberData.progress,
    //       lastMeeting: memberData.lastMeeting,
    //       futureMeeting: memberData.futureMeeting,
    //       status: memberData.status,
    //       request: memberData.request,
    //     },
    //   })),
    // });
    return 'ok';
  }
  static async delete(id: Duty['id']) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    await prisma.duty.delete({ where: { id } });
    return 'ok';
  }
  //Duty projects
  static async getProjects() {
    // if (!cui) throw new AppError(`Oops!, algo salio mal`, 400);
    const projects = await prisma.contratc.findMany({
      select: { id: true, cui: true, projectName: true },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return projects;
  }
  // static async getProject(cui: Contratc['cui']) {
  //   if (!cui) throw new AppError(`Oops!, algo salio mal`, 400);
  //   await prisma.contratc.findFirst({ where: { cui } });
  //   return 'ok';
  // }
}
export default DutyServices;
