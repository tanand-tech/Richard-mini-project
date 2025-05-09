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
exports.alert = exports.user = void 0;
exports.init = init;
exports.listen = listen;
exports.parse = parse;
exports.query = query;
exports.client = client;
const config_1 = __importDefault(require("config"));
const util_1 = require("@/util");
const lodash_1 = require("lodash");
const pg_1 = __importDefault(require("pg"));
const logger_1 = __importDefault(require("logger"));
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.INT8, parseInt);
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.NUMERIC, parseFloat);
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.JSONB, JSON.parse);
const log = (0, logger_1.default)('POSTGRES');
log.setLogLevel(process.env.POSTGRES_LOG_LEVEL || 'info');
const subscribers = {};
const pool = new pg_1.default.Pool(config_1.default.get('postgres'));
pool.on('error', (e) => {
    log.fatal('Unexpected error on idle client', e);
    process.exit(-1);
});
let listener;
async function init() {
    listener = await pool.connect();
    listener.on('notification', ({ channel, payload }) => {
        try {
            const data = JSON.parse(payload);
            log.debug('Incoming notification', { channel, data });
            subscribers[channel].forEach((callback) => callback(data));
        }
        catch (e) {
            log.error(e);
        }
    });
}
async function listen(channel, callback) {
    try {
        if (!subscribers[channel]) {
            subscribers[channel] = [];
            await listener.query(`listen ${channel}`);
        }
        subscribers[channel].push(callback);
    }
    catch (e) {
        log.error(e);
        throw e;
    }
}
function parse(row) {
    return Object.fromEntries(Object.entries(row).map(([k, v]) => [(0, lodash_1.camelCase)(k), v instanceof Date ? (0, util_1.date)(v) : v]));
}
async function query(query, values) {
    try {
        return (await pool.query(query, values)).rows.map(parse);
    }
    catch (e) {
        log.error(query, values);
        throw e;
    }
}
async function client() {
    return pool.connect();
}
exports.user = __importStar(require("./user"));
exports.alert = __importStar(require("./alert"));
//# sourceMappingURL=index.js.map