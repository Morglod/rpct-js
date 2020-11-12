import type * as child_process from 'child_process';
import { EventEmitter } from 'tsee';
import { StreamReadableEvents, StreamWritableEvents } from './istream';

export class IPCDuplexStream<ReadChunk = string | Uint8Array, WriteChunk = string | Uint8Array> extends EventEmitter<StreamReadableEvents<ReadChunk> & StreamWritableEvents> {
    readonly _cur_process?: NodeJS.Process;
    readonly _child_process?: child_process.ChildProcess;
    
    write(chunk: WriteChunk, callback?: Function): boolean;
    write(chunk: WriteChunk, stringEncoding?: string, callback?: Function): boolean;

    write(chunk: WriteChunk, callbac_stringEncoding?: string|Function, callback?: Function): boolean {
        if (typeof callbac_stringEncoding === 'function') {
            callback = callbac_stringEncoding;
        }
        if (this._cur_process) {
            return this._cur_process.send!(chunk as any as string, undefined, undefined, err => {
                if (callback) callback(err);
            });
        }
        if (this._child_process) {
            return this._child_process.send(chunk as any as string, err => {
                if (callback) callback(err);
            });
        }
        return false;
    }

    private _handleProcessMessage = (message: any, sendHandle: any) => {
        this.emit('data', message);
    };

    constructor(proc?: NodeJS.Process, childProc?: child_process.ChildProcess) {
        super();

        this._cur_process = proc;
        this._child_process = childProc;

        if (proc) proc.addListener('message', this._handleProcessMessage);
        if (childProc) childProc.addListener('message', this._handleProcessMessage);
    }
}
