import { EventEmitter } from 'tsee';
import { Duplex, TransformOptions, Transform } from 'stream';

import { IStreamDuplex, asDuplexStream, StreamReadableEvents, IStreamWritable, IStreamReadable, asWritableStream, StreamWritableEvents, asReadableStream } from '../streams/istream';

export function simpleCrossStream<
    Chunk,
>(): {
    ar: IStreamReadable<Chunk>,
    aw: IStreamWritable<Chunk>,
    br: IStreamReadable<Chunk>,
    bw: IStreamWritable<Chunk>,
    a: IStreamDuplex<Chunk, Chunk>,
    b: IStreamDuplex<Chunk, Chunk>,
} {
    class VirtualStream<Chunk> extends EventEmitter<StreamReadableEvents<Chunk>> {
        constructor(public target: VirtualStream<Chunk>) {
            super();
        }

        write(chunk: Chunk, stringEncoding_cb?: string|Function, callback?: Function): boolean {
            this.target.emit('data', chunk);
            if (typeof stringEncoding_cb === 'function') stringEncoding_cb();
            if (typeof callback === 'function') callback();
            return true;
        }
    }

    const a = new VirtualStream(undefined!);
    const b = new VirtualStream(a);
    a.target = b;

    return {
        ar: asReadableStream(a),
        aw: asWritableStream(a),
        br: asReadableStream(b),
        bw: asWritableStream(b),
        a: asDuplexStream(a),
        b: asDuplexStream(b),
    };
}

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
export function debugStream<Chunk = string|Uint8Array>(
    onChunk: (chunk: Chunk, encoding: string) => void|Promise<void>,
    opts: TransformOptions = { objectMode: true },
) {
    const trans = new Transform({
        ...opts,
        transform(chunk, enc, cb) {
            const r = onChunk(chunk, enc);
            if (r instanceof Promise) r.then(v => cb(undefined, v)).catch(re => cb(re));
            else cb(undefined, chunk);
        }
    });

    return trans;
}
