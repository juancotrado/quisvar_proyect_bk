class Queries {
  static selectProfileUser = {
    select: {
      id: true,
      ruc: true,
      address: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          dni: true,
          phone: true,
          degree: true,
          description: true,
        },
      },
    },
  };
  static selectProfileShort = {
    select: {
      id: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          dni: true,
        },
      },
    },
  };

  static includeSubtask = {
    Levels: {
      select: {
        userId: true,
      },
    },
    feedBacks: {
      include: {
        users: { include: { user: this.selectProfileUser } },
        files: true,
      },
    },
    files: true,
    users: {
      select: {
        percentage: true,
        assignedAt: true,
        untilDate: true,
        status: true,
        user: this.selectProfileUser,
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
