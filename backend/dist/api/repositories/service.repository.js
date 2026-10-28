"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRepository = void 0;
const mongoose_1 = require("mongoose");
const Service_model_1 = require("../models/Service.model");
exports.serviceRepository = {
    /** Services starting in [from, to), oldest first, for the calendar. */
    listBetween: (from, to) => Service_model_1.ServiceModel.find({ date: { $gte: from, $lt: to } }).sort({ date: 1 }).exec(),
    /**
     * Returns null for a malformed id as well as for a missing service, so callers
     * always deal with "not found" instead of a cast error.
     */
    findById: (id) => (0, mongoose_1.isValidObjectId)(id) ? Service_model_1.ServiceModel.findById(id).exec() : Promise.resolve(null),
    create: (data) => Service_model_1.ServiceModel.create(data),
    updateById: (id, update) => Service_model_1.ServiceModel.findByIdAndUpdate(id, update, { new: true }).exec(),
    deleteById: (id) => Service_model_1.ServiceModel.findByIdAndDelete(id).exec()
};
