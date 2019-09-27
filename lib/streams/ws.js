"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsee = __importStar(require("tsee"));
exports.WEBSOCKET_STREAM_DATA_FAIL = Symbol('WEBSOCKET_STREAM_DATA_FAIL');
/** returns message's payload or WEBSOCKET_STREAM_DATA_FAIL if it's not this protocol message */
function defaultWebSocketStreamDataUnpacker(evt) {
    try {
        const str = typeof evt.data === 'string' ? evt.data : Buffer.from(evt.data).toString('utf8');
        return JSON.parse(str);
    }
    catch (_a) { }
    return exports.WEBSOCKET_STREAM_DATA_FAIL;
}
exports.defaultWebSocketStreamDataUnpacker = defaultWebSocketStreamDataUnpacker;
/** returns message's data with packed payload */
function defaultWebSocketStreamDataPacker(payload) {
    const data = JSON.stringify(payload);
    return data;
}
exports.defaultWebSocketStreamDataPacker = defaultWebSocketStreamDataPacker;
function createWebSocketReadStream(ws, opts = {}) {
    const { stream, handler, } = createWebSocketReadStreamHandler(opts);
    ws.addEventListener('message', handler);
    const disposer = () => {
        ws.removeEventListener('message', handler);
    };
    return {
        stream,
        disposer,
    };
}
exports.createWebSocketReadStream = createWebSocketReadStream;
function createWebSocketReadStreamHandler(opts = {}) {
    const { unpack = defaultWebSocketStreamDataUnpacker, } = opts;
    const stream = new tsee.EventEmitter();
    const handler = (evt) => {
        const payload = unpack(evt);
        if (payload !== exports.WEBSOCKET_STREAM_DATA_FAIL) {
            stream.emit('data', payload);
        }
    };
    return {
        stream,
        handler,
    };
}
exports.createWebSocketReadStreamHandler = createWebSocketReadStreamHandler;
class WebSocketWriteStream extends tsee.EventEmitter {
    constructor(ws, opts) {
        super();
        this.ws = ws;
        this.opts = opts;
        this.packer = opts.pack || defaultWebSocketStreamDataPacker;
    }
    write(chunk, stringEncoding_callback, callback) {
        if (typeof stringEncoding_callback === 'function') {
            callback = stringEncoding_callback;
        }
        const data = this.packer(chunk);
        this.ws.send(data);
        if (callback)
            callback();
        return true;
    }
}
exports.WebSocketWriteStream = WebSocketWriteStream;
function createWebSocketWriteStream(ws, opts = {}) {
    return new WebSocketWriteStream(ws, opts);
}
exports.createWebSocketWriteStream = createWebSocketWriteStream;
