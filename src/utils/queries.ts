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
  static selectSpecialist = {
    select: {
      career: true,
      name: true,
      phone: true,
      cip: true,
      dni: true,
      pdf: true,
    },
  };
  static selectProfileUser = {
    select: {
      id: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          dni: true,
          phone: true,
        },
      },
    },
  };
}
export default Queries;
