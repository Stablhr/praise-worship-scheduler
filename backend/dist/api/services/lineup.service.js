"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineupService = void 0;
exports.toSongDto = toSongDto;
exports.toLineupDto = toLineupDto;
const error_1 = require("../utils/error");
const errorCodes_1 = require("../constants/errorCodes");
const service_repository_1 = require("../repositories/service.repository");
const lineup_repository_1 = require("../repositories/lineup.repository");
const notification_service_1 = require("./notification.service");
function toSongDto(song) {
    return {
        id: song._id.toString(),
        title: song.title,
        link: song.link,
        type: song.type,
        order: song.order
    };
}
function toLineupDto(lineup) {
    const sorted = [...lineup.songs].sort((a, b) => a.order - b.order);
    return {
        serviceId: lineup.serviceId.toString(),
        songs: sorted.map(toSongDto)
    };
}
async function requireService(serviceId) {
    const service = await service_repository_1.serviceRepository.findById(serviceId);
    if (!service) {
        throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.SERVICE_NOT_FOUND, 'We could not find this service');
    }
    return service;
}
async function requireLineup(serviceId) {
    const lineup = await lineup_repository_1.lineupRepository.findByService(serviceId);
    if (!lineup) {
        throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.LINEUP_NOT_FOUND, 'We could not find a lineup for this service');
    }
    return lineup;
}
exports.lineupService = {
    /** Returns the lineup for one service, creating an empty one if needed. */
    async get(serviceId) {
        await requireService(serviceId);
        const lineup = await lineup_repository_1.lineupRepository.findOrCreate(serviceId);
        return toLineupDto(lineup);
    },
    /** Adds a song and returns the updated lineup. */
    async addSong(serviceId, input, addedBy) {
        await requireService(serviceId);
        const lineup = await lineup_repository_1.lineupRepository.addSong(serviceId, {
            title: input.title,
            link: input.link || undefined,
            type: input.type,
            addedBy
        });
        // Notify all members that the lineup changed.
        void notification_service_1.notificationService.notifyLineupChanged(serviceId);
        return toLineupDto(lineup);
    },
    /** Updates a song and returns the updated lineup. */
    async updateSong(serviceId, songId, input) {
        await requireService(serviceId);
        const lineup = await lineup_repository_1.lineupRepository.updateSong(serviceId, songId, {
            title: input.title,
            link: input.link,
            type: input.type
        });
        if (!lineup) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.SONG_NOT_FOUND, 'We could not find this song');
        }
        void notification_service_1.notificationService.notifyLineupChanged(serviceId);
        return toLineupDto(lineup);
    },
    /** Removes a song and returns the updated lineup. */
    async deleteSong(serviceId, songId) {
        await requireService(serviceId);
        const lineup = await lineup_repository_1.lineupRepository.deleteSong(serviceId, songId);
        if (!lineup) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.SONG_NOT_FOUND, 'We could not find this song');
        }
        void notification_service_1.notificationService.notifyLineupChanged(serviceId);
        return toLineupDto(lineup);
    },
    /** Reorders songs and returns the updated lineup. */
    async reorderSongs(serviceId, songIds) {
        await requireService(serviceId);
        const lineup = await lineup_repository_1.lineupRepository.reorderSongs(serviceId, songIds);
        if (!lineup) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.LINEUP_NOT_FOUND, 'We could not find a lineup for this service');
        }
        void notification_service_1.notificationService.notifyLineupChanged(serviceId);
        return toLineupDto(lineup);
    }
};
