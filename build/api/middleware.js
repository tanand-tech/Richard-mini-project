"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequest = logRequest;
exports.authTelegram = authTelegram;
const dayjs_1 = __importDefault(require("dayjs"));
const logger_1 = __importDefault(require("logger"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const util_1 = require("@/api/util");
const auth_1 = require("@/services/auth");
const fs_1 = require("fs");
const log = (0, logger_1.default)('API', 'AUTH');
log.setLogLevel(process.env.LOG_REQUEST === 'true' ? 'debug' : 'info');
const PATH = './logs/api';
if (!(0, fs_1.existsSync)(PATH))
    (0, fs_1.mkdirSync)(PATH, { recursive: true });
node_schedule_1.default.scheduleJob('0 0 * * *', async function (fireDate) {
    try {
        const cutoff = (0, dayjs_1.default)(fireDate).subtract(30, 'day');
        for (const f of (0, fs_1.readdirSync)(PATH + '/'))
            if ((0, dayjs_1.default)(f.split('.')[0]).isBefore(cutoff))
                (0, fs_1.unlinkSync)(PATH + '/' + f);
    }
    catch (e) {
        log.error(e);
    }
});
async function logRequest(request, response, next) {
    const date = (0, dayjs_1.default)();
    const { method, path, params, query, body, cookies, headers } = request;
    const ip = request.header('x-client-ip') || request.header('x-real-ip') || request.ip;
    log.debug(`Incoming request ${method} ${path} from ${ip}`);
    (0, fs_1.createWriteStream)(`${PATH}/${date.format('YYYY-MM-DD')}.jsonl`, { flags: 'a' }).write(`${JSON.stringify({
        time: date.format('YYYY-MM-DD HH:mm:ss'),
        method,
        path,
        headers,
        ip,
        params,
        query,
        body,
        cookies,
    })}\n`);
    response.locals.ip = ip;
    response.locals.timestamp = date.unix();
    next();
}
async function authTelegram(request, response, next) {
    if (process.env.DISABLE_TELEGRAM_AUTH?.toLowerCase() === 'true')
        return next();
    const token = request.header('Authorization');
    if (!token)
        return (0, util_1.failure)(response, 'Authorization not found', 401);
    try {
        (0, auth_1.verify)(token, { ignoreExpiration: false });
        next();
    }
    catch (e) {
        log.error(e.message);
        return (0, util_1.failure)(response, e, 401);
    }
}
//# sourceMappingURL=middleware.js.map