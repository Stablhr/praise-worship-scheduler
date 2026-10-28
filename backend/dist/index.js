"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const app_1 = __importDefault(require("./app"));
const db_1 = require("./api/config/db");
const env_1 = require("./api/config/env");
const node_cron_1 = __importDefault(require("node-cron"));
const notification_service_1 = require("./api/services/notification.service");
let dbInitPromise = null;
const ensureDb = () => {
    if (!dbInitPromise) {
        dbInitPromise = (0, db_1.connectDb)();
    }
    return dbInitPromise;
};
async function handler(req, res) {
    try {
        await ensureDb();
        return (0, app_1.default)(req, res);
    }
    catch (error) {
        console.error('Failed to connect to database', error);
        return res.status(500).json({ message: 'Database connection failed' });
    }
}
if (process.env.VERCEL !== '1') {
    ensureDb()
        .then(() => {
        // Daily reminder job: 9:00 AM Asia/Manila = 1:00 AM UTC.
        node_cron_1.default.schedule('0 1 * * *', () => {
            notification_service_1.notificationService
                .runReminderJob()
                .catch(error => console.error('Reminder job failed', error));
        });
        app_1.default.listen(env_1.env.PORT, () => {
            console.log(`Server listening on port ${env_1.env.PORT}`);
        });
    })
        .catch(error => {
        console.error('Failed to connect to database', error);
        process.exit(1);
    });
}
