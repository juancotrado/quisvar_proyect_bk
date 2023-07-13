import { SubTasks } from '@prisma/client';

class Queries {
  static includeSubtask = {
    feedBacks: {
      include: {
        files: {
          include: {
            user: {
              select: {
                profile: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    },
    files: {
      include: {
        user: {
          select: {
            profile: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    },
    users: {
      select: {
        percentage: true,
        assignedAt: true,
        untilDate: true,
        user: {
          select: {
            id: true,
            profile: true,
          },
        },
      },
    },
  };
}
export default Queries;
