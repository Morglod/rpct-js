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
exports.WINDOW_STREAM_DATA_FAIL = Symbol('WINDOW_STREAM_DATA_FAIL');
/** returns message's payload or WINDOW_STREAM_DATA_FAIL if it's not this protocol message */
function defaultWindowStreamDataUnpacker(evt) {
    try {
        const val = JSON.parse(evt.data);
        if (typeof val === 'object' && val.type === '_$_rpct-window-stream_$_' && ('payload' in val)) {
            return val.payload;
        }
    }
    catch (_a) { }
    return exports.WINDOW_STREAM_DATA_FAIL;
}
exports.defaultWindowStreamDataUnpacker = defaultWindowStreamDataUnpacker;
/** returns message's data with packed payload */
function defaultWindowStreamDataPacker(payload) {
    const msg = {
        type: '_$_rpct-window-stream_$_',
        payload,
    };
    const data = JSON.stringify(msg);
    return data;
}
exports.defaultWindowStreamDataPacker = defaultWindowStreamDataPacker;
function createWindowReadStream(window, opts = {}) {
    const { stream, handler, } = createWindowReadStreamHandler(opts);
    window.addEventListener('message', handler);
    const disposer = () => {
        window.removeEventListener('message', handler);
    };
    return {
        stream,
        disposer,
    };
}
exports.createWindowReadStream = createWindowReadStream;
function createWindowReadStreamHandler(opts = {}) {
    const { unpack = defaultWindowStreamDataUnpacker, } = opts;
    const stream = new tsee.EventEmitter();
    const handler = (evt) => {
        const payload = unpack(evt);
        if (payload !== exports.WINDOW_STREAM_DATA_FAIL) {
            stream.emit('data', payload);
        }
    };
    return {
        stream,
        handler,
    };
}
exports.createWindowReadStreamHandler = createWindowReadStreamHandler;
class WindowWriteStream extends tsee.EventEmitter {
    constructor(window, opts) {
        super();
        this.window = window;
        this.opts = opts;
        this.packer = opts.pack || defaultWindowStreamDataPacker;
        this.targetOrigin = opts.targetOrigin || '*';
    }
    write(chunk, stringEncoding_callback, callback) {
        if (typeof stringEncoding_callback === 'function') {
            callback = stringEncoding_callback;
        }
        const data = this.packer(chunk);
        this.window.postMessage(data, this.targetOrigin);
        if (callback)
            callback();
        return true;
    }
}
exports.WindowWriteStream = WindowWriteStream;
function createWindowWriteStream(window, opts = {}) {
    return new WindowWriteStream(window, opts);
}
exports.createWindowWriteStream = createWindowWriteStream;
