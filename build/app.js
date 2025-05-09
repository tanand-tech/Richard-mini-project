"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("logger"));
const loader_1 = __importDefault(require("@/loader"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const duration_1 = __importDefault(require("dayjs/plugin/duration"));
dotenv_1.default.config();
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
dayjs_1.default.extend(duration_1.default);
dayjs_1.default.tz.setDefault('Asia/Kuala_Lumpur');
const log = (0, logger_1.default)('APP');
log.info('Starting');
void (0, loader_1.default)().then(() => log.info('Loaders completed'));
process.on('uncaughtException', (e) => {
    log.fatal('uncaughtException', e);
    process.exit();
});
process.on('unhandledRejection', (e) => {
    log.fatal('unhandledRejection', e);
    process.exit();
});
//# sourceMappingURL=app.js.map