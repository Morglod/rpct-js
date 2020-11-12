"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToParentProcess = exports.connectToChildProcess = void 0;
const ipc_1 = require("../streams/ipc");
const duplex_json_stream_1 = require("../transports/duplex-json-stream");
function connectToChildProcess(childProc) {
    const ipc_stream = new ipc_1.IPCDuplexStream(undefined, childProc);
    const transport = new duplex_json_stream_1.DuplexJsonStreamTransport(ipc_stream, undefined, 'ipc_to_child_' + childProc.pid);
    return transport;
}
exports.connectToChildProcess = connectToChildProcess;
function connectToParentProcess(masterProc) {
    const ipc_stream = new ipc_1.IPCDuplexStream(masterProc, undefined);
    const transport = new duplex_json_stream_1.DuplexJsonStreamTransport(ipc_stream, undefined, 'ipc_to_parent_' + masterProc.pid);
    return transport;
}
exports.connectToParentProcess = connectToParentProcess;
