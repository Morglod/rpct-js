/// <reference types="node" />
import { TransformOptions, Transform } from 'stream';
import { IStreamDuplex, IStreamWritable, IStreamReadable } from './stream.types';
export declare function simpleCrossStream<Chunk>(): {
    ar: IStreamReadable<Chunk>;
    aw: IStreamWritable<Chunk>;
    br: IStreamReadable<Chunk>;
    bw: IStreamWritable<Chunk>;
    a: IStreamDuplex<Chunk, Chunk>;
    b: IStreamDuplex<Chunk, Chunk>;
};
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
export declare function debugStream<Chunk = string | Uint8Array>(onChunk: (chunk: Chunk, encoding: string) => void | Promise<void>, opts?: TransformOptions): Transform;
