"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userBySession = userBySession;
const axios_1 = __importDefault(require("axios"));
const provider = axios_1.default.create({ baseURL: process.env.GRAFANA_ENDPOINT ?? 'http://localhost:3000', timeout: 3000 });
provider.interceptors.response.use(undefined, (e) => {
    throw Error(e.response?.data?.message ?? e.message);
});
async function userBySession(token) {
    return (await provider.get('/api/user', { headers: { Cookie: `grafana_session=${token}` } })).data;
}
//# sourceMappingURL=grafana.js.map