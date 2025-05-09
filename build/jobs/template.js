"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("logger"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const log = (0, logger_1.default)('JOBS', 'TEMPLATE');
node_schedule_1.default.scheduleJob('*/1 * * * *', (date = new Date()) => {
    log.info(date.toISOString());
});
//# sourceMappingURL=template.js.map