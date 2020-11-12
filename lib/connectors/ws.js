"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectWS = void 0;
const ws_1 = __importDefault(require("ws"));
const ws_2 = require("../streams/ws");
const browser_1 = require("../bundles/browser");
function connectWS(url_ws, opts) {
    let ws;
    if (typeof url_ws === 'string') {
        ws = new ws_1.default(url_ws, opts);
    }
    else {
        ws = url_ws;
    }
    const { stream: rstream, disposer: rdisposer } = ws_2.createWebSocketReadStream(ws);
    const wstream = ws_2.createWebSocketWriteStream(ws);
    return new browser_1.StreamTransport(rstream, wstream);
}
exports.connectWS = connectWS;
