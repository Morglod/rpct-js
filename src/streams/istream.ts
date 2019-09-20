import { IEventEmitter } from "tsee";

export type StreamReadableEvents<Chunk = string|Uint8Array> = {
    close(): void,
    error(err: Error): void,
    data(chunk: Chunk): void,
};

export type StreamWritableEvents = {
    close(): void,
    error(err: Error): void,
};

export interface IStreamReadable<Chunk = string|Uint8Array> extends IEventEmitter<StreamReadableEvents<Chunk>> {

}

export type StreamReadableLike<Chunk = string|Uint8Array> = IStreamReadable<Chunk>|NodeJS.ReadableStream;

export interface IStreamWritable<Chunk = string|Uint8Array> extends IEventEmitter<StreamWritableEvents> {
    write(chunk: Chunk, callback?: Function): boolean;
    write(chunk: Chunk, stringEncoding?: string, callback?: Function): boolean;
}

export type StreamWritableLike<Chunk = string|Uint8Array> = IStreamWritable<Chunk>|NodeJS.WritableStream;

export interface IStreamDuplex<
    ReadChunk = string|Uint8Array,
    WriteChunk = string|Uint8Array,
> extends IEventEmitter<StreamReadableEvents<ReadChunk> & StreamWritableEvents> {
    write(chunk: WriteChunk, callback?: Function): boolean;
    write(chunk: WriteChunk, stringEncoding?: string, callback?: Function): boolean;
}

export type StreamDuplexLike<
    ReadChunk = string|Uint8Array,
    WriteChunk = string|Uint8Array,
> = IStreamDuplex<ReadChunk, WriteChunk>|NodeJS.ReadWriteStream;

export function asReadableStream<
    T extends StreamReadableLike<Chunk>,
    Chunk = string|Uint8Array
>(rstream: T): IStreamReadable<Chunk> {
    return rstream as any;
}

export function asWritableStream<
    T extends StreamWritableLike<Chunk>,
    Chunk = string|Uint8Array
>(wstream: T): IStreamWritable<Chunk> {
    return wstream as any;
}

export function asDuplexStream<
    T extends StreamDuplexLike<ReadChunk, WriteChunk>,
    ReadChunk = string|Uint8Array,
    WriteChunk = string|Uint8Array,
>(rwstream: T): IStreamDuplex<ReadChunk, WriteChunk> {
    return rwstream as any;
}
