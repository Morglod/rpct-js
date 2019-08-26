"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var tsee = __importStar(require("tsee"));
exports.WINDOW_STREAM_DATA_FAIL = Symbol('WINDOW_STREAM_DATA_FAIL');
/** returns message's payload or WINDOW_STREAM_DATA_FAIL if it's not this protocol message */
function defaultWindowStreamDataUnpacker(evt) {
    try {
        var val = JSON.parse(evt.data);
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
    var msg = {
        type: '_$_rpct-window-stream_$_',
        payload: payload,
    };
    var data = JSON.stringify(msg);
    return data;
}
exports.defaultWindowStreamDataPacker = defaultWindowStreamDataPacker;
function createWindowReadStream(window, opts) {
    if (opts === void 0) { opts = {}; }
    var _a = createWindowReadStreamHandler(opts), stream = _a.stream, handler = _a.handler;
    window.addEventListener('message', handler);
    var disposer = function () {
        window.removeEventListener('message', handler);
    };
    return {
        stream: stream,
        disposer: disposer,
    };
}
exports.createWindowReadStream = createWindowReadStream;
function createWindowReadStreamHandler(opts) {
    if (opts === void 0) { opts = {}; }
    var _a = opts.unpack, unpack = _a === void 0 ? defaultWindowStreamDataUnpacker : _a;
    var stream = new tsee.EventEmitter();
    var handler = function (evt) {
        var payload = unpack(evt);
        if (payload !== exports.WINDOW_STREAM_DATA_FAIL) {
            stream.emit('data', payload);
        }
    };
    return {
        stream: stream,
        handler: handler,
    };
}
exports.createWindowReadStreamHandler = createWindowReadStreamHandler;
var WindowWriteStream = /** @class */ (function (_super) {
    __extends(WindowWriteStream, _super);
    function WindowWriteStream(window, opts) {
        var _this = _super.call(this) || this;
        _this.window = window;
        _this.opts = opts;
        _this.packer = opts.pack || defaultWindowStreamDataPacker;
        _this.targetOrigin = opts.targetOrigin || '*';
        return _this;
    }
    WindowWriteStream.prototype.write = function (chunk, stringEncoding_callback, callback) {
        if (typeof stringEncoding_callback === 'function') {
            callback = stringEncoding_callback;
        }
        var data = this.packer(chunk);
        this.window.postMessage(data, this.targetOrigin);
        if (callback)
            callback();
        return true;
    };
    return WindowWriteStream;
}(tsee.EventEmitter));
exports.WindowWriteStream = WindowWriteStream;
function createWindowWriteStream(window, opts) {
    if (opts === void 0) { opts = {}; }
    return new WindowWriteStream(window, opts);
}
exports.createWindowWriteStream = createWindowWriteStream;
