"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugStream = exports.simpleCrossStream = void 0;
const tsee_1 = require("tsee");
const stream_1 = require("stream");
const istream_1 = require("../streams/istream");
function simpleCrossStream() {
    class VirtualStream extends tsee_1.EventEmitter {
        constructor(target) {
            super();
            this.target = target;
        }
        write(chunk, stringEncoding_cb, callback) {
            this.target.emit('data', chunk);
            if (typeof stringEncoding_cb === 'function')
                stringEncoding_cb();
            if (typeof callback === 'function')
                callback();
            return true;
        }
    }
    const a = new VirtualStream(undefined);
    const b = new VirtualStream(a);
    a.target = b;
    return {
        ar: istream_1.asReadableStream(a),
        aw: istream_1.asWritableStream(a),
        br: istream_1.asReadableStream(b),
        bw: istream_1.asWritableStream(b),
        a: istream_1.asDuplexStream(a),
        b: istream_1.asDuplexStream(b),
    };
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
    const trans = new stream_1.Transform(Object.assign(Object.assign({}, opts), { transform(chunk, enc, cb) {
            const r = onChunk(chunk, enc);
            if (r instanceof Promise)
                r.then(v => cb(undefined, v)).catch(re => cb(re));
            else
                cb(undefined, chunk);
        } }));
    return trans;
}
exports.debugStream = debugStream;
