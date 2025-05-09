"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.date = date;
exports.random = random;
exports.sleep = sleep;
exports.memoizeDebounce = memoizeDebounce;
const dayjs_1 = __importDefault(require("dayjs"));
const lodash_1 = require("lodash");
function date(d) {
    return (d == null ? d : (0, dayjs_1.default)(d).format('YYYY-MM-DDTHH:mm:ss.SSSZ'));
}
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
async function sleep(time = 1000) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
function memoizeDebounce(func, wait = 0, options = {}, resolver) {
    const debounceMemo = (0, lodash_1.memoize)((..._args) => (0, lodash_1.debounce)(func, wait, options), resolver);
    function wrappedFunction(...args) {
        return debounceMemo(...args)(...args);
    }
    const flush = (...args) => {
        return debounceMemo(...args).flush();
    };
    const cancel = (...args) => {
        return debounceMemo(...args).cancel();
    };
    wrappedFunction.flush = flush;
    wrappedFunction.cancel = cancel;
    return wrappedFunction;
}
//# sourceMappingURL=util.js.map