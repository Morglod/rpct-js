/// <reference types="node" />
import type * as child_process from 'child_process';
import { EventEmitter } from 'tsee';
import { StreamReadableEvents, StreamWritableEvents } from './istream';
export declare class IPCDuplexStream<ReadChunk = string | Uint8Array, WriteChunk = string | Uint8Array> extends EventEmitter<StreamReadableEvents<ReadChunk> & StreamWritableEvents> {
    readonly _cur_process?: NodeJS.Process;
    readonly _child_process?: child_process.ChildProcess;
    write(chunk: WriteChunk, callback?: Function): boolean;
    write(chunk: WriteChunk, stringEncoding?: string, callback?: Function): boolean;
    private _handleProcessMessage;
    constructor(proc?: NodeJS.Process, childProc?: child_process.ChildProcess);
}
