"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.failure = failure;
function success(response, data, code = 200) {
    response.status(code).send(data);
}
function failure(response, error = 'WIP', code = 400) {
    response.status(code).send(error);
}
//# sourceMappingURL=util.js.map