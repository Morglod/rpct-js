"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPCDuplexStream = void 0;
const tsee_1 = require("tsee");
class IPCDuplexStream extends tsee_1.EventEmitter {
    constructor(proc, childProc) {
        super();
        this._handleProcessMessage = (message, sendHandle) => {
            this.emit('data', message);
        };
        this._cur_process = proc;
        this._child_process = childProc;
        if (proc)
            proc.addListener('message', this._handleProcessMessage);
        if (childProc)
            childProc.addListener('message', this._handleProcessMessage);
    }
    write(chunk, callbac_stringEncoding, callback) {
        if (typeof callbac_stringEncoding === 'function') {
            callback = callbac_stringEncoding;
        }
        if (this._cur_process) {
            return this._cur_process.send(chunk, undefined, undefined, err => {
                if (callback)
                    callback(err);
            });
        }
        if (this._child_process) {
            return this._child_process.send(chunk, err => {
                if (callback)
                    callback(err);
            });
        }
        return false;
    }
}
exports.IPCDuplexStream = IPCDuplexStream;
