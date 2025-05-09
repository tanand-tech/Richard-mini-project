"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const service_1 = __importDefault(require("./service"));
const { host, port, topicPrefix, options } = config_1.default.get('mqtt');
const mqtt = new service_1.default(host, port, topicPrefix, options, process.env.MQTT_LOG_LEVEL ?? 'info');
exports.default = mqtt;
//# sourceMappingURL=index.js.map