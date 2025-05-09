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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertTelegram = alertTelegram;
const logger_1 = __importDefault(require("logger"));
const _1 = require("./");
const util = __importStar(require("@/util"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const lodash_1 = require("lodash");
const alertHandler_1 = __importDefault(require("./alertHandler"));
const redis = __importStar(require("@/services/redis"));
const postgres = __importStar(require("@/services/postgres"));
const auth_1 = require("@/services/auth");
const log = (0, logger_1.default)('TELEGRAM', 'ALERT');
const alertTrigger = (0, lodash_1.debounce)(postAlerts, 1000, { maxWait: 5000 });
redis.alert
    .listenAlert(alertTrigger)
    .then(() => log.info('Listening to alert cache'))
    .catch(log.error);
node_schedule_1.default.scheduleJob('* * * * *', alertTrigger).invoke();
async function postAlerts() {
    try {
        await _1.provider.get('/health');
    }
    catch (e) {
        log.warn(e.message);
        return;
    }
    const alerts = [];
    try {
        while (alerts.length < 10) {
            const alert = await redis.alert.alert();
            if (alert)
                alerts.push(alert);
            else
                break;
        }
        log.info(`Found ${alerts.length} alerts`);
        if (!alerts.length)
            return;
        const users = (await postgres.user.telegramUsers()).map((u) => ({
            ...u,
            r: new RegExp(u.subscriptions ?? 'a^'),
        }));
        const payload = (await Promise.all(alerts.map(async (a) => {
            try {
                return {
                    users: users.filter((u) => u.r.test(a.type)).map((u) => u.telegramId),
                    ...(await (0, alertHandler_1.default)(a)),
                };
            }
            catch (e) {
                log.error(e);
                return { users: [] };
            }
        }))).filter((a) => a.users.length && a.message);
        await _1.provider.post('/alert', payload, {
            timeout: 10000,
            headers: { project: auth_1.project, Authorization: (0, auth_1.sign)(undefined, { expiresIn: '1m' }) },
        });
        log.info(`${payload.length} alerts sent successfully`);
        if (await redis.alert.hasAlerts())
            util.sleep(1000).then(postAlerts);
    }
    catch (e) {
        log.error(e, alerts);
        try {
            while (alerts.length)
                await redis.alert.setAlert(alerts.shift(), true);
        }
        catch (e) {
            log.fatal(e);
        }
    }
}
async function alertTelegram(a) {
    await redis.alert.setAlert(a, false);
}
//# sourceMappingURL=alert.js.map