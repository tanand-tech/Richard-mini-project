"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.project = void 0;
exports.sign = sign;
exports.verify = verify;
const config_1 = __importDefault(require("config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { project, privateKey, publicKey } = config_1.default.get('auth');
exports.project = project;
function sign(data, options) {
    return jsonwebtoken_1.default.sign({ project, ...data }, privateKey, { algorithm: 'RS256', ...options });
}
function verify(token, options) {
    return jsonwebtoken_1.default.verify(token, publicKey, { algorithms: ['RS256'], ...options });
}
//# sourceMappingURL=auth.js.map