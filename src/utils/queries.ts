class Queries {
  static includeSubtask = {
    feedBacks: {
      include: {
        files: true,
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
        assignedAt: true,
        untilDate: true,
        user: {
          select: {
            profile: true,
          },
        },
      },
    },
  };
}
export default Queries;
