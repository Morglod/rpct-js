import { IEventEmitter } from "tsee";
import * as streams from 'stream';

export type StreamReadableEvents<Chunk = Buffer|string|Uint8Array> = {
    close(): void,
    error(err: Error): void,
    data(chunk: Chunk): void,
};

export type StreamWritableEvents = {
    close(): void,
    error(err: Error): void,
};

export interface IStreamReadable<Chunk = Buffer|string|Uint8Array> extends IEventEmitter<StreamReadableEvents<Chunk>> {

}

export type StreamReadableLike<Chunk = Buffer|string|Uint8Array> = IStreamReadable<Chunk>|NodeJS.ReadableStream;

export interface IStreamWritable<Chunk = Buffer|string|Uint8Array> extends IEventEmitter<StreamWritableEvents> {
    write(chunk: Chunk, callback?: Function): boolean;
    write(chunk: Chunk, stringEncoding?: string, callback?: Function): boolean;
}

export type StreamWritableLike<Chunk = Buffer|string|Uint8Array> = IStreamWritable<Chunk>|NodeJS.WritableStream;

export interface IStreamDuplex<
    ReadChunk = Buffer|string|Uint8Array,
    WriteChunk = Buffer|string|Uint8Array,
> extends IEventEmitter<StreamReadableEvents<ReadChunk> & StreamWritableEvents> {
    write(chunk: WriteChunk, callback?: Function): boolean;
    write(chunk: WriteChunk, stringEncoding?: string, callback?: Function): boolean;
}

export type StreamDuplexLike<
    ReadChunk = Buffer|string|Uint8Array,
    WriteChunk = Buffer|string|Uint8Array,
> = IStreamDuplex<ReadChunk, WriteChunk>|NodeJS.ReadWriteStream;

/**
 * Works like: src -> dst; dst -> src  
 * eg to emulate remote connection
 */
export function simpleCrossStream<
    Chunk = Buffer|string|Uint8Array,
>(opts: { objectMode?: boolean, highWaterMark?: number } = {}): IStreamDuplex<Chunk, Chunk> {
    const {
        objectMode = true,
        highWaterMark = undefined,
    } = opts;

    const data = [] as Chunk[];

    const duplex = new streams.Duplex({
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

export function asReadableStream<
    T extends StreamReadableLike<Chunk>,
    Chunk = Buffer|string|Uint8Array
>(rstream: T): IStreamReadable<Chunk> {
    return rstream as any;
}

export function asWritableStream<
    T extends StreamWritableLike<Chunk>,
    Chunk = Buffer|string|Uint8Array
>(wstream: T): IStreamWritable<Chunk> {
    return wstream as any;
}

export function asDuplexStream<
    T extends StreamDuplexLike<ReadChunk, WriteChunk>,
    ReadChunk = Buffer|string|Uint8Array,
    WriteChunk = Buffer|string|Uint8Array,
>(rwstream: T): IStreamDuplex<ReadChunk, WriteChunk> {
    return rwstream as any;
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
export function debugStream<Chunk = Buffer|string|Uint8Array>(
    onChunk: (chunk: Chunk, encoding: string) => void|Promise<void>,
    opts: streams.TransformOptions = { objectMode: true },
) {
    const trans = new streams.Transform({
        ...opts,
        transform(chunk, enc, cb) {
            const r = onChunk(chunk, enc);
            if (r instanceof Promise) r.then(v => cb(undefined, v)).catch(re => cb(re));
            else cb(undefined, chunk);
        }
    });

    return trans;
}