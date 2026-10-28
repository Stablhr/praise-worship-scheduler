"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineupController = void 0;
const lineup_service_1 = require("../services/lineup.service");
/**
 * Lineup routes are thin (backend/AGENTS.md): validate in the route, decide in
 * the service, shape the response here.
 */
exports.lineupController = {
    async get(req, res, next) {
        try {
            const lineup = await lineup_service_1.lineupService.get(req.params.serviceId);
            res.status(200).json({ lineup });
        }
        catch (error) {
            next(error);
        }
    },
    async addSong(req, res, next) {
        try {
            const addedBy = req.member?.id;
            const lineup = await lineup_service_1.lineupService.addSong(req.params.serviceId, req.body, addedBy);
            res.status(201).json({ lineup });
        }
        catch (error) {
            next(error);
        }
    },
    async updateSong(req, res, next) {
        try {
            const lineup = await lineup_service_1.lineupService.updateSong(req.params.serviceId, req.params.songId, req.body);
            res.status(200).json({ lineup });
        }
        catch (error) {
            next(error);
        }
    },
    async deleteSong(req, res, next) {
        try {
            const lineup = await lineup_service_1.lineupService.deleteSong(req.params.serviceId, req.params.songId);
            res.status(200).json({ lineup });
        }
        catch (error) {
            next(error);
        }
    },
    async reorderSongs(req, res, next) {
        try {
            const lineup = await lineup_service_1.lineupService.reorderSongs(req.params.serviceId, req.body.songIds);
            res.status(200).json({ lineup });
        }
        catch (error) {
            next(error);
        }
    }
};
