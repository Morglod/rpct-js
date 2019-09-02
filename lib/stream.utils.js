"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const stream_types_1 = require("./stream.types");
/**
 * Works like: src -> dst; dst -> src
 * eg to emulate remote connection
 */
function simpleCrossStream(opts = {}) {
    const { objectMode = true, highWaterMark = undefined, } = opts;
    const data = [];
    const duplex = new stream_1.Duplex({
        objectMode,
        highWaterMark,
        write(chunk, enc, cb) {
            data.push(chunk);
            if (cb)
                cb();
        },
        read() {
            if (data.length === 0) {
                this.push(undefined);
                return;
            }
            const last = data[data.length - 1];
            data.pop();
            this.push(last);
        }
    });
    return stream_types_1.asDuplexStream(duplex);
}
exports.simpleCrossStream = simpleCrossStream;
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
function debugStream(onChunk, opts = { objectMode: true }) {
    const trans = new stream_1.Transform(Object.assign({}, opts, { transform(chunk, enc, cb) {
            const r = onChunk(chunk, enc);
            if (r instanceof Promise)
                r.then(v => cb(undefined, v)).catch(re => cb(re));
            else
                cb(undefined, chunk);
        } }));
    return trans;
}
exports.debugStream = debugStream;
