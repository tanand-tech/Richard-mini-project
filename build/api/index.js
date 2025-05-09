"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("config"));
const express_1 = __importDefault(require("express"));
const router_1 = __importDefault(require("./router"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const { port } = config_1.default.get('api');
const app = (0, express_1.default)();
app.set('trust proxy', true);
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '1gb' }));
app.use('/', router_1.default);
app.listen(port, () => {
    console.table((0, express_list_endpoints_1.default)(app)
        .sort(({ path: a }, { path: b }) => (a < b ? -1 : a > b ? 1 : 0))
        .map(({ path, methods }) => ({ path, methods: methods.join(',') })));
});
exports.default = app;
//# sourceMappingURL=index.js.map