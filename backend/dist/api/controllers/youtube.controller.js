"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeController = void 0;
const error_1 = require("../utils/error");
const youtube_service_1 = require("../services/youtube.service");
exports.youtubeController = {
    async search(req, res, next) {
        try {
            const rawQuery = req.query.q;
            const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
            if (query.length < 2) {
                throw new error_1.ApiError(400, 'VALIDATION_ERROR', 'Please enter at least 2 characters to search.');
            }
            const results = await youtube_service_1.youtubeService.searchVideos(query);
            res.status(200).json({ results });
        }
        catch (error) {
            next(error);
        }
    },
    async video(req, res, next) {
        try {
            const rawId = req.query.id;
            const id = typeof rawId === 'string' ? rawId.trim() : '';
            if (!id) {
                throw new error_1.ApiError(400, 'VALIDATION_ERROR', 'Video id is required.');
            }
            const video = await youtube_service_1.youtubeService.getVideo(id);
            res.status(200).json({ video });
        }
        catch (error) {
            next(error);
        }
    }
};
