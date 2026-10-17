import {isValidObjectId, UpdateQuery} from 'mongoose';
import {ServiceDocument, ServiceModel} from '../models/Service.model';

export const serviceRepository = {
  /** Services starting in [from, to), oldest first, for the calendar. */
  listBetween: (from: Date, to: Date) =>
    ServiceModel.find({date: {$gte: from, $lt: to}}).sort({date: 1}).exec(),

  /**
   * Returns null for a malformed id as well as for a missing service, so callers
   * always deal with "not found" instead of a cast error.
   */
  findById: (id: string) =>
    isValidObjectId(id) ? ServiceModel.findById(id).exec() : Promise.resolve(null),

  create: (data: Partial<ServiceDocument>) => ServiceModel.create(data),

  updateById: (id: string, update: UpdateQuery<ServiceDocument>) =>
    ServiceModel.findByIdAndUpdate(id, update, {new: true}).exec(),

  deleteById: (id: string) => ServiceModel.findByIdAndDelete(id).exec()
};
