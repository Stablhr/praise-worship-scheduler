import {MemberDocument, MemberModel} from '../models/Member.model';

export const memberRepository = {
  findByEmail: (email: string) =>
    MemberModel.findOne({email: email.toLowerCase()}).exec(),

  findById: (id: string) => MemberModel.findById(id).exec(),

  create: (data: Partial<MemberDocument>) => MemberModel.create(data),

  /** First sign-in setup: the member sets their own name and password. */
  activate: (id: string, data: {name: string; passwordHash: string}) =>
    MemberModel.findByIdAndUpdate(
      id,
      {...data, activatedAt: new Date()},
      {new: true}
    ).exec()
};
