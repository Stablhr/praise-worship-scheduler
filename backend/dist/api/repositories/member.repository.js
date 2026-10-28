"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberRepository = void 0;
const mongoose_1 = require("mongoose");
const Member_model_1 = require("../models/Member.model");
exports.memberRepository = {
    findByEmail: (email) => Member_model_1.MemberModel.findOne({ email: email.toLowerCase() }).exec(),
    /**
     * Returns null for a malformed id as well as for a missing member, so callers
     * always deal with "not found" instead of a cast error.
     */
    findById: (id) => (0, mongoose_1.isValidObjectId)(id) ? Member_model_1.MemberModel.findById(id).exec() : Promise.resolve(null),
    /** The whole team, for the Members screen. */
    list: () => Member_model_1.MemberModel.find().sort({ name: 1 }).collation({ locale: 'en' }).exec(),
    /** Looks up the people assigned to a service in one query. */
    listByIds: (ids) => Member_model_1.MemberModel.find({ _id: { $in: ids } }).exec(),
    create: (data) => Member_model_1.MemberModel.create(data),
    updateById: (id, update) => Member_model_1.MemberModel.findByIdAndUpdate(id, update, { new: true }).exec(),
    deleteById: (id) => Member_model_1.MemberModel.findByIdAndDelete(id).exec(),
    /** Used to stop the last admin from being removed or demoted. */
    countAdmins: () => Member_model_1.MemberModel.countDocuments({ permission: 'admin' }).exec(),
    /**
     * First sign-in setup: the member sets their own name and password. The
     * position is only written when one was given, so a position an admin set
     * on the Members screen is never overwritten by the sign-up form.
     */
    activate: (id, data) => Member_model_1.MemberModel.findByIdAndUpdate(id, {
        name: data.name,
        passwordHash: data.passwordHash,
        ...(data.position ? { position: data.position } : {}),
        activatedAt: new Date()
    }, { new: true }).exec()
};
