"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const dayjs_1 = __importDefault(require("dayjs"));
const logger_1 = __importDefault(require("logger"));
const _1 = require("./");
const log = (0, logger_1.default)('ALERT');
async function default_1(alert) {
    try {
        const lastTrigger = (0, dayjs_1.default)(alert.lastTrigger).format('YYYY-MM-DD HH:mm:ss');
        switch (alert.type) {
            default:
                throw Error(`Unknown alert type ${alert.type}`);
            case 'offline': {
                return {
                    message: (0, _1.escape)(`\`\`\`
\u{1f534}\t${lastTrigger}\`\`\`
*${JSON.stringify(alert.tags)}*\t\tOffline
\`\`\`
${JSON.stringify(alert.params)}
\`\`\`
                    `),
                };
            }
        }
    }
    catch (e) {
        log.fatal(e);
        return;
    }
}
//# sourceMappingURL=alertHandler.js.map