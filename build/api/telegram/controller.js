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
exports.message = exports.refresh = void 0;
const logger_1 = __importDefault(require("logger"));
const auth_1 = require("@/services/auth");
const util_1 = require("@/api/util");
const telegram = __importStar(require("@/services/telegram"));
const log = (0, logger_1.default)('API', 'TELEGRAM');
const refresh = async function (request, response) {
    const token = request.header('Authorization');
    log.silly('GET', token);
    if (!token)
        return (0, util_1.failure)(response, 'Authorization not found', 401);
    try {
        (0, auth_1.verify)(token, { ignoreExpiration: true });
    }
    catch (e) {
        log.error(e.message);
        return (0, util_1.failure)(response, e, 401);
    }
    try {
        await telegram.refreshToken();
        log.silly('Refresh success');
        (0, util_1.success)(response);
    }
    catch (e) {
        log.error(e);
        (0, util_1.failure)(response, e, 400);
    }
};
exports.refresh = refresh;
const message = async function (request, response) {
    try {
        (0, util_1.success)(response, await telegram.handleTelegram(request.body));
    }
    catch (e) {
        log.error(e);
        (0, util_1.failure)(response, e, 400);
    }
};
exports.message = message;
//# sourceMappingURL=controller.js.map