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
exports.alert = void 0;
exports.subscribe = subscribe;
const config_1 = __importDefault(require("config"));
const service_1 = __importDefault(require("./service"));
const util_1 = require("@/util");
const logger_1 = __importDefault(require("logger"));
const { namespace, ...options } = config_1.default.get('redis');
const minLevel = process.env.REDIS_LOG_LEVEL || 'info';
const log = (0, logger_1.default)('REDIS').setLogLevel(minLevel);
const redis = new service_1.default(options, namespace, minLevel);
exports.default = redis;
async function subscribe(pattern, subscriber) {
    try {
        const callback = (0, util_1.memoizeDebounce)(subscriber, 50, { maxWait: 1000 });
        await redis.psubscribe(`__keyspace@${redis.db}__:` + pattern, (_, key, event) => callback(key, event));
        (await redis.keys(pattern)).forEach((key) => subscriber(key));
    }
    catch (e) {
        log.error(e);
    }
}
exports.alert = __importStar(require("./alert"));
//# sourceMappingURL=index.js.map