"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alert = alert;
exports.setAlert = setAlert;
exports.listenAlert = listenAlert;
exports.hasAlerts = hasAlerts;
const index_1 = __importDefault(require("./index"));
const logger_1 = __importDefault(require("logger"));
const log = (0, logger_1.default)('REDIS', 'ALERT');
async function alert() {
    return index_1.default.lpop(`${index_1.default.namespace}:alert:cache`);
}
async function setAlert(alert, front = false) {
    return index_1.default[front ? 'lpush' : 'rpush'](`${index_1.default.namespace}:alert:cache`, alert);
}
async function listenAlert(listener) {
    try {
        await index_1.default.psubscribe(`__keyspace@${index_1.default.db}__:${index_1.default.namespace}:alert:cache`, async (p, k, event) => {
            try {
                if (event === 'lpush' || event === 'rpush')
                    await listener();
            }
            catch (e) {
                log.error(e);
            }
        });
    }
    catch (e) {
        log.error(e);
    }
}
async function hasAlerts() {
    return !!(await index_1.default.exists(`${index_1.default.namespace}:alert:cache`));
}
//# sourceMappingURL=alert.js.map