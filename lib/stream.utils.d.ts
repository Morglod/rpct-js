/// <reference types="node" />
import { TransformOptions, Transform } from 'stream';
import { IStreamDuplex } from './stream.types';
/**
 * Works like: src -> dst; dst -> src
 * eg to emulate remote connection
 */
export declare function simpleCrossStream<Chunk = string | Uint8Array>(opts?: {
    objectMode?: boolean;
    highWaterMark?: number;
}): IStreamDuplex<Chunk, Chunk>;
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
