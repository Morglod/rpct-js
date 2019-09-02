import { Duplex, TransformOptions, Transform } from 'stream';
import { IStreamDuplex, asDuplexStream } from './stream.types';

/**
 * Works like: src -> dst; dst -> src  
 * eg to emulate remote connection
 */
export function simpleCrossStream<
    Chunk = string|Uint8Array,
>(opts: { objectMode?: boolean, highWaterMark?: number } = {}): IStreamDuplex<Chunk, Chunk> {
    const {
        objectMode = true,
        highWaterMark = undefined,
    } = opts;

    const data = [] as Chunk[];

    const duplex = new Duplex({
        objectMode,
        highWaterMark,
        write(chunk: any, enc: string, cb: Function) {
            data.push(chunk);
            if (cb) cb();
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

    return asDuplexStream(duplex);
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