import {isValidObjectId, UpdateQuery} from 'mongoose';
import {MemberDocument, MemberModel} from '../models/Member.model';

export const memberRepository = {
  findByEmail: (email: string) =>
    MemberModel.findOne({email: email.toLowerCase()}).exec(),

  /**
   * Returns null for a malformed id as well as for a missing member, so callers
   * always deal with "not found" instead of a cast error.
   */
  findById: (id: string) =>
    isValidObjectId(id) ? MemberModel.findById(id).exec() : Promise.resolve(null),

  /** The whole team, for the Members screen. */
  list: () => MemberModel.find().sort({name: 1}).collation({locale: 'en'}).exec(),

  create: (data: Partial<MemberDocument>) => MemberModel.create(data),

  updateById: (id: string, update: UpdateQuery<MemberDocument>) =>
    MemberModel.findByIdAndUpdate(id, update, {new: true}).exec(),

  deleteById: (id: string) => MemberModel.findByIdAndDelete(id).exec(),

  /** Used to stop the last admin from being removed or demoted. */
  countAdmins: () => MemberModel.countDocuments({permission: 'admin'}).exec(),

  /** First sign-in setup: the member sets their own name and password. */
  activate: (id: string, data: {name: string; passwordHash: string}) =>
    MemberModel.findByIdAndUpdate(
      id,
      {...data, activatedAt: new Date()},
      {new: true}
    ).exec()
};
