/// <reference types="node" />
import { IEventEmitter } from "tsee";
import * as streams from 'stream';
export declare type StreamReadableEvents<Chunk = Buffer | string | Uint8Array> = {
    close(): void;
    error(err: Error): void;
    data(chunk: Chunk): void;
};
export declare type StreamWritableEvents = {
    close(): void;
    error(err: Error): void;
};
export interface IStreamReadable<Chunk = Buffer | string | Uint8Array> extends IEventEmitter<StreamReadableEvents<Chunk>> {
}
export declare type StreamReadableLike<Chunk = Buffer | string | Uint8Array> = IStreamReadable<Chunk> | NodeJS.ReadableStream;
export interface IStreamWritable<Chunk = Buffer | string | Uint8Array> extends IEventEmitter<StreamWritableEvents> {
    write(chunk: Chunk, callback?: Function): boolean;
    write(chunk: Chunk, stringEncoding?: string, callback?: Function): boolean;
}
export declare type StreamWritableLike<Chunk = Buffer | string | Uint8Array> = IStreamWritable<Chunk> | NodeJS.WritableStream;
export interface IStreamDuplex<ReadChunk = Buffer | string | Uint8Array, WriteChunk = Buffer | string | Uint8Array> extends IEventEmitter<StreamReadableEvents<ReadChunk> & StreamWritableEvents> {
    write(chunk: WriteChunk, callback?: Function): boolean;
    write(chunk: WriteChunk, stringEncoding?: string, callback?: Function): boolean;
}
export declare type StreamDuplexLike<ReadChunk = Buffer | string | Uint8Array, WriteChunk = Buffer | string | Uint8Array> = IStreamDuplex<ReadChunk, WriteChunk> | NodeJS.ReadWriteStream;
/**
 * Works like: src -> dst; dst -> src
 * eg to emulate remote connection
 */
export declare function simpleCrossStream<Chunk = Buffer | string | Uint8Array>(opts?: {
    objectMode?: boolean;
    highWaterMark?: number;
}): IStreamDuplex<Chunk, Chunk>;
export declare function asReadableStream<T extends StreamReadableLike<Chunk>, Chunk = Buffer | string | Uint8Array>(rstream: T): IStreamReadable<Chunk>;
export declare function asWritableStream<T extends StreamWritableLike<Chunk>, Chunk = Buffer | string | Uint8Array>(wstream: T): IStreamWritable<Chunk>;
export declare function asDuplexStream<T extends StreamDuplexLike<ReadChunk, WriteChunk>, ReadChunk = Buffer | string | Uint8Array, WriteChunk = Buffer | string | Uint8Array>(rwstream: T): IStreamDuplex<ReadChunk, WriteChunk>;
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
export declare function debugStream<Chunk = Buffer | string | Uint8Array>(onChunk: (chunk: Chunk, encoding: string) => void | Promise<void>, opts?: streams.TransformOptions): streams.Transform;
