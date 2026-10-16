import {MemberDocument, MemberModel} from '../models/Member.model';

export const memberRepository = {
  findByEmail: (email: string) =>
    MemberModel.findOne({email: email.toLowerCase()}).exec(),

  findById: (id: string) => MemberModel.findById(id).exec(),

  create: (data: Partial<MemberDocument>) => MemberModel.create(data),

  /** Keeps the name and photo in sync with the Google account on every sign-in. */
  syncGoogleProfile: (
    id: string,
    data: Pick<MemberDocument, 'name' | 'googleId'> & {photoUrl?: string}
  ) => MemberModel.findByIdAndUpdate(id, data, {new: true}).exec()
};
