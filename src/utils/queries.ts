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
  static selectCompany = {
    select: {
      // id: true,
      name: true,
      manager: true,
      percentage: true,
      ruc: true,
    },
  };
  static selectConsortium = {
    select: {
      // id: true,
      manager: true,
      name: true,
      companies: this.selectCompany,
    },
  };
  static selectSubtaskDetails = {
    select: {
      id: true,
      item: true,
      name: true,
      description: true,
      price: true,
      status: true,
      users: {
        select: {
          percentage: true,
          user: this.selectProfileUser,
        },
      },
    },
  };
  static selectDuplicateLevelSubtasks = {
    select: {
      id: true,
      hours: true,
      item: true,
      name: true,
      price: true,
      files: {
        where: { type: 'MATERIAL' },
      },
    },
  };
}
export default Queries;
