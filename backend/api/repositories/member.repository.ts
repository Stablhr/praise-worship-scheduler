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

  /** Looks up the people assigned to a service in one query. */
  listByIds: (ids: string[]) => MemberModel.find({_id: {$in: ids}}).exec(),

  create: (data: Partial<MemberDocument>) => MemberModel.create(data),

  updateById: (id: string, update: UpdateQuery<MemberDocument>) =>
    MemberModel.findByIdAndUpdate(id, update, {new: true}).exec(),

  deleteById: (id: string) => MemberModel.findByIdAndDelete(id).exec(),

  /** Used to stop the last admin from being removed or demoted. */
  countAdmins: () => MemberModel.countDocuments({permission: 'admin'}).exec(),

  /**
   * First sign-in setup: the member sets their own name and password. The
   * position is only written when one was given, so a position an admin set
   * on the Members screen is never overwritten by the sign-up form.
   */
  activate: (
    id: string,
    data: {name: string; passwordHash: string; position?: string}
  ) =>
    MemberModel.findByIdAndUpdate(
      id,
      {
        name: data.name,
        passwordHash: data.passwordHash,
        ...(data.position ? {position: data.position} : {}),
        activatedAt: new Date()
      },
      {new: true}
    ).exec()
};
