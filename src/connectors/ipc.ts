import type * as child_process from 'child_process';
import type { ITransport } from '../transports/itransport';
import { IPCDuplexStream } from '../streams/ipc';
import { DuplexJsonStreamTransport } from '../transports/duplex-json-stream';

export function connectToChildProcess(childProc: child_process.ChildProcess): ITransport {
    const ipc_stream = new IPCDuplexStream(undefined, childProc);
    const transport = new DuplexJsonStreamTransport(ipc_stream, undefined, 'ipc_to_child_' + childProc.pid);
    return transport;
}

export function connectToParentProcess(masterProc: NodeJS.Process): ITransport {
    const ipc_stream = new IPCDuplexStream(masterProc, undefined);
    const transport = new DuplexJsonStreamTransport(ipc_stream, undefined, 'ipc_to_parent_' + masterProc.pid);
    return transport;
}