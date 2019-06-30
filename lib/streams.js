"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var streams = __importStar(require("stream"));
/**
 * Works like: src -> dst; dst -> src
 * eg to emulate remote connection
 */
function simpleCrossStream(opts) {
    if (opts === void 0) { opts = {}; }
    var _a = opts.objectMode, objectMode = _a === void 0 ? true : _a, _b = opts.highWaterMark, highWaterMark = _b === void 0 ? undefined : _b;
    var data = [];
    var duplex = new streams.Duplex({
        objectMode: objectMode,
        highWaterMark: highWaterMark,
        write: function (chunk, enc, cb) {
            data.push(chunk);
            if (cb)
                cb();
        },
        read: function () {
            if (data.length === 0) {
                this.push(undefined);
                return;
            }
            var last = data[data.length - 1];
            data.pop();
            this.push(last);
        }
    });
    return asDuplexStream(duplex);
}
exports.simpleCrossStream = simpleCrossStream;
function asReadableStream(rstream) {
    return rstream;
}
exports.asReadableStream = asReadableStream;
function asWritableStream(wstream) {
    return wstream;
}
exports.asWritableStream = asWritableStream;
function asDuplexStream(rwstream) {
    return rwstream;
}
exports.asDuplexStream = asDuplexStream;
/**
 * Debug output of stream.
 * eg:
 *
 * ```ts
    const readable = socket.pipe(decodeStream).pipe(
        debugStream(chunk => {
            console.log('remote read', chunk)
        })
    );

    const streamTransport = new StreamTransport(readable, writable, undefined, 'remote');
 * ```
 */
function debugStream(onChunk, opts) {
    if (opts === void 0) { opts = { objectMode: true }; }
    var trans = new streams.Transform(__assign({}, opts, { transform: function (chunk, enc, cb) {
            var r = onChunk(chunk, enc);
            if (r instanceof Promise)
                r.then(function (v) { return cb(undefined, v); }).catch(function (re) { return cb(re); });
            else
                cb(undefined, chunk);
        } }));
    return trans;
}
exports.debugStream = debugStream;
