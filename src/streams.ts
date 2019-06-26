import { IEventEmitter } from "tsee";

export type StreamReadableEvents = {
    close(): void,
    error(err: Error): void,
};

export type StreamWritableEvents = {
    close(): void,
    error(err: Error): void,
    data(chunk: Buffer|string|Uint8Array): void,
};

export interface IStreamReadable extends IEventEmitter<StreamReadableEvents> {

}

export interface IStreamWritable extends IEventEmitter<StreamWritableEvents> {
    write(chunk: Buffer|string|Uint8Array, callback?: Function): boolean;
    write(chunk: Buffer|string|Uint8Array, stringEncoding?: string, callback?: Function): boolean;
}

export interface IStreamDuplex extends IEventEmitter<StreamReadableEvents & StreamWritableEvents> {
    write(chunk: Buffer|string|Uint8Array, callback?: Function): boolean;
    write(chunk: Buffer|string|Uint8Array, stringEncoding?: string, callback?: Function): boolean;
}

export function simpleCrossStream(): IStreamDuplex {
    const data = [] as any[];
    const duplex = require('stream').Duplex;
    return new duplex({
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
}