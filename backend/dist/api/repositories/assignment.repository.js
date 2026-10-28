"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentRepository = void 0;
const Assignment_model_1 = require("../models/Assignment.model");
exports.assignmentRepository = {
    listByService: (serviceId) => Assignment_model_1.AssignmentModel.find({ serviceId }).sort({ createdAt: 1 }).exec(),
    /**
     * Swaps in a whole set of assignments, which is what "Save assignments" does:
     * the admin sends the finished picture, not a diff.
     */
    replaceForService: async (serviceId, entries) => {
        await Assignment_model_1.AssignmentModel.deleteMany({ serviceId }).exec();
        if (entries.length > 0) {
            await Assignment_model_1.AssignmentModel.insertMany(entries.map(entry => ({
                serviceId,
                role: entry.role,
                memberId: entry.memberId
            })));
        }
    },
    deleteByService: (serviceId) => Assignment_model_1.AssignmentModel.deleteMany({ serviceId }).exec(),
    /** Drops the assignments of roles a service no longer has. */
    deleteByRolesNotIn: (serviceId, roles) => Assignment_model_1.AssignmentModel.deleteMany({ serviceId, role: { $nin: roles } }).exec(),
    /** A removed member should not stay assigned to anything. */
    deleteByMember: (memberId) => Assignment_model_1.AssignmentModel.deleteMany({ memberId }).exec()
};
