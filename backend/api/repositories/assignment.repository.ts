import {AssignmentDocument, AssignmentModel} from '../models/Assignment.model';

export type AssignmentEntry = {role: string; memberId: string};

export const assignmentRepository = {
  listByService: (serviceId: string) =>
    AssignmentModel.find({serviceId}).sort({createdAt: 1}).exec(),

  /**
   * Swaps in a whole set of assignments, which is what "Save assignments" does:
   * the admin sends the finished picture, not a diff.
   */
  replaceForService: async (
    serviceId: string,
    entries: AssignmentEntry[]
  ): Promise<void> => {
    await AssignmentModel.deleteMany({serviceId}).exec();

    if (entries.length > 0) {
      await AssignmentModel.insertMany(
        entries.map(entry => ({
          serviceId,
          role: entry.role,
          memberId: entry.memberId
        }))
      );
    }
  },

  deleteByService: (serviceId: string) =>
    AssignmentModel.deleteMany({serviceId}).exec(),

  /** Drops the assignments of roles a service no longer has. */
  deleteByRolesNotIn: (serviceId: string, roles: readonly string[]) =>
    AssignmentModel.deleteMany({serviceId, role: {$nin: roles}}).exec(),

  /** A removed member should not stay assigned to anything. */
  deleteByMember: (memberId: string) =>
    AssignmentModel.deleteMany({memberId}).exec()
};

export type AssignmentRecord = AssignmentDocument;
