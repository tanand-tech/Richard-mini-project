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
Object.defineProperty(exports, "__esModule", { value: true });
exports.active = active;
exports.alerts = alerts;
exports.resolve = resolve;
exports.subscribeAlert = subscribeAlert;
exports.upsert = upsert;
exports.updateLastAlert = updateLastAlert;
const util_1 = require("@/util");
const postgres = __importStar(require("./index"));
async function active(type, tags) {
    const q = `
    select *
    from alert
    where type = $1
      and tags = $2
      and resolve is null;
    `;
    return (await postgres.query(q, [type, tags])).pop();
}
async function alerts(limit, offset) {
    const query = `
    select *
    from alert
    order by timestamp desc
    limit $1 offset $2;
    `;
    return postgres.query(query, [limit, offset]);
}
async function resolve(type, tags, timestamp = (0, util_1.date)(new Date())) {
    const query = `
    update alert
    set resolve      = $3,
        last_trigger = $3
    where type = $1
      and tags = $2
      and resolve is null
    returning *;
    `;
    return (await postgres.query(query, [type, tags, timestamp])).pop();
}
async function subscribeAlert(callback) {
    return postgres.listen('alert', (a) => callback(postgres.parse(a)));
}
async function upsert(type, tags, timestamp, params = {}) {
    const query = `
    insert into alert (type, tags, timestamp, last_trigger, params)
    values ($1, $2, $3, $3, $4)
    on conflict (type, tags)
    where resolve is null do
    update
    set last_trigger = $3,
        params       = $4,
        count        = alert.count + 1
    returning *;
    `;
    return (await postgres.query(query, [type, tags, timestamp, params]))[0];
}
async function updateLastAlert(type, tags, timestamp, lastAlertTime = (0, util_1.date)(new Date())) {
    const query = `
    update alert
    set last_alert = $4
    where type = $1
      and tags = $2
      and timestamp = $3;
    `;
    await postgres.query(query, [type, tags, timestamp, lastAlertTime]);
}
//# sourceMappingURL=alert.js.map