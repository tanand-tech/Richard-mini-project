"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTelegram = exports.alertTelegram = exports.provider = void 0;
exports.escape = escape;
exports.refreshToken = refreshToken;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("config"));
const auth_1 = require("@/services/auth");
function escape(message) {
    return message?.replace(/(`{3}[^`]*`{3}|`[^`]*`)|(?<!\\)([_*[\]()~`>#+\-=|{}.!])/g, (match, code) => code ?? `\\${match}`);
}
exports.provider = axios_1.default.create({ baseURL: config_1.default.get('telegram').endpoint, timeout: 5000 });
exports.provider.interceptors.response.use(undefined, (e) => {
    throw Error(e.message);
});
var alert_1 = require("./alert");
Object.defineProperty(exports, "alertTelegram", { enumerable: true, get: function () { return alert_1.alertTelegram; } });
var handler_1 = require("./handler");
Object.defineProperty(exports, "handleTelegram", { enumerable: true, get: function () { return handler_1.handleTelegram; } });
async function refreshToken(expiresIn = '1h') {
    const Authorization = (0, auth_1.sign)(undefined, { expiresIn });
    await exports.provider.post('/token', undefined, { headers: { Authorization, project: auth_1.project } });
}
//# sourceMappingURL=index.js.map