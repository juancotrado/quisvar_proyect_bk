import { Mail } from '@prisma/client';

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
          job: true,
        },
      },
    },
  };
  static selectProfileUserForStage = {
    select: {
      id: true,
      role: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          dni: true,
          phone: true,
          job: true,
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
          description: true,
        },
      },
    },
  };

  static includeSubtask = {
    Levels: {
      select: {
        userId: true,
        stages: {
          select: {
            group: {
              select: {
                id: true,
                name: true,
                groups: {
                  select: { users: Queries.selectProfileUserForStage },
                },
              },
            },
          },
        },
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

  static includeBasictask = {
    Levels: {
      select: {
        userId: true,
        stages: {
          select: {
            group: {
              select: {
                id: true,
                name: true,
                groups: {
                  select: { users: Queries.selectProfileUserForStage },
                },
              },
            },
          },
        },
      },
    },
    // feedBacks: {
    //   include: {
    //     users: { include: { user: this.selectProfileUser } },
    //     files: true,
    //   },
    // },
    files: true,
    // users: {
    //   select: {
    //     percentage: true,
    //     assignedAt: true,
    //     untilDate: true,
    //     status: true,
    //     user: this.selectProfileUser,
    //   },
    // },
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
  static selectContractStage = {
    select: {
      createdAt: true,
      cui: true,
      department: true,
      details: true,
      difficulty: true,
      district: true,
      id: true,
      name: true,
      projectId: true,
      projectName: true,
      province: true,
      projectShortName: true,
    },
  };
  static selectContract = {
    select: {
      createdAt: true,
      cui: true,
      amount: true,
      department: true,
      difficulty: true,
      district: true,
      id: true,
      name: true,
      indexContract: true,
      projectId: true,
      projectName: true,
      type: true,
      province: true,
      projectShortName: true,
      consortiumId: true,
      companyId: true,
      contractNumber: true,
      phases: true,
    },
  };
  static PayMail(): PayMailQueries {
    return new PayMailQueries();
  }
}

class PayMailQueries {
  public selectMessage(role: Mail['role'], type?: Mail['type']) {
    return {
      select: {
        id: true,
        header: true,
        status: true,
        type: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        users: {
          where: { type, role },
          select: {
            type: true,
            role: true,
            status: true,
            userInit: true,
            user: Queries.selectProfileUser,
          },
        },
      },
    };
  }
}

export default Queries;
