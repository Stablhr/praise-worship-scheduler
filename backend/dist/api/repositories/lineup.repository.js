"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineupRepository = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Lineup_model_1 = require("../models/Lineup.model");
exports.lineupRepository = {
    /** Returns null for a malformed id or a missing lineup. */
    findByService: (serviceId) => (0, mongoose_1.isValidObjectId)(serviceId)
        ? Lineup_model_1.LineupModel.findOne({ serviceId }).exec()
        : Promise.resolve(null),
    /** Creates an empty lineup for a service. */
    createForService: (serviceId) => Lineup_model_1.LineupModel.create({ serviceId, songs: [] }),
    /**
     * Returns an existing lineup or creates an empty one, so callers never have
     * to handle "no lineup yet".
     */
    findOrCreate: async (serviceId) => {
        const existing = await exports.lineupRepository.findByService(serviceId);
        if (existing)
            return existing;
        return exports.lineupRepository.createForService(serviceId);
    },
    /**
     * Adds a song and returns the updated lineup. The song is appended at the end.
     */
    addSong: async (serviceId, song) => {
        const lineup = await exports.lineupRepository.findOrCreate(serviceId);
        const order = lineup.songs.length;
        lineup.songs.push({
            _id: new mongoose_1.default.Types.ObjectId(),
            title: song.title,
            link: song.link,
            type: song.type,
            order,
            addedBy: song.addedBy
                ? new mongoose_1.default.Types.ObjectId(song.addedBy)
                : undefined,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await lineup.save();
        return lineup;
    },
    /** Updates one song's title, link or type. */
    updateSong: async (serviceId, songId, changes) => {
        const lineup = await exports.lineupRepository.findByService(serviceId);
        if (!lineup)
            return null;
        const song = lineup.songs.id(songId);
        if (!song)
            return null;
        if (changes.title !== undefined)
            song.title = changes.title;
        if (changes.link !== undefined)
            song.link = changes.link || undefined;
        if (changes.type !== undefined)
            song.type = changes.type;
        await lineup.save();
        return lineup;
    },
    /** Removes one song. */
    deleteSong: async (serviceId, songId) => {
        const lineup = await exports.lineupRepository.findByService(serviceId);
        if (!lineup)
            return null;
        const song = lineup.songs.id(songId);
        if (!song)
            return null;
        song.deleteOne();
        await lineup.save();
        return lineup;
    },
    /** Reorders songs to match the given id list. */
    reorderSongs: async (serviceId, songIds) => {
        const lineup = await exports.lineupRepository.findByService(serviceId);
        if (!lineup)
            return null;
        const byId = new Map(lineup.songs.map(song => [song._id.toString(), song]));
        const reordered = [];
        for (const id of songIds) {
            const song = byId.get(id);
            if (song)
                reordered.push(song);
        }
        // Append any songs that were not mentioned, so nothing is lost.
        for (const song of lineup.songs) {
            if (!songIds.includes(song._id.toString()))
                reordered.push(song);
        }
        reordered.forEach((song, index) => {
            song.order = index;
        });
        lineup.songs = reordered;
        await lineup.save();
        return lineup;
    }
};
