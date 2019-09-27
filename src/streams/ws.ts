import { IStreamReadable, StreamReadableEvents, IStreamWritable, StreamWritableEvents } from "../streams/istream";
import * as tsee from 'tsee';
import { ITransportProtocol } from "../transports/itransport";
import WebSocket from 'ws';

export const WEBSOCKET_STREAM_DATA_FAIL = Symbol('WEBSOCKET_STREAM_DATA_FAIL');
export type WEBSOCKET_STREAM_DATA_FAIL = typeof WEBSOCKET_STREAM_DATA_FAIL;

/** returns message's payload or WEBSOCKET_STREAM_DATA_FAIL if it's not this protocol message */
export function defaultWebSocketStreamDataUnpacker(evt: WebSocket.MessageEvent): ITransportProtocol|WEBSOCKET_STREAM_DATA_FAIL {
    try {
        const str = typeof evt.data === 'string' ? evt.data : Buffer.from(evt.data as any).toString('utf8');
        return JSON.parse(str);
    } catch { }
    return WEBSOCKET_STREAM_DATA_FAIL;
}

/** returns message's data with packed payload */
export function defaultWebSocketStreamDataPacker(payload: ITransportProtocol): any {
    const data = JSON.stringify(payload);
    return data;
}

type ReadOpts = {
    /** pick payload from protocol or return WEBSOCKET_STREAM_DATA_FAIL */
    unpack?: (evt: WebSocket.MessageEvent) => ITransportProtocol|WEBSOCKET_STREAM_DATA_FAIL,
};

type WriteOpts = {
    /** save payload to protocol */
    pack?: (payload: any) => any,
};

export function createWebSocketReadStream(
    ws: WebSocket,
    opts: ReadOpts = {},
): {
    stream: IStreamReadable<ITransportProtocol>,
    disposer: () => void,
 } {
    const {
        stream,
        handler,
    } = createWebSocketReadStreamHandler(opts);
    
    ws.addEventListener('message', handler);
    
    const disposer = () => {
        ws.removeEventListener('message', handler);
    };

    return {
        stream,
        disposer,
    };
}

export function createWebSocketReadStreamHandler(
    opts: ReadOpts = {},
): {
    stream: IStreamReadable<ITransportProtocol>,
    handler: (evt: WebSocket.MessageEvent) => void,
 } {
    const {
        unpack = defaultWebSocketStreamDataUnpacker,
    } = opts;

    const stream = new tsee.EventEmitter<StreamReadableEvents<ITransportProtocol>>();

    const handler = (evt: WebSocket.MessageEvent) => {
        const payload = unpack(evt);
        if (payload !== WEBSOCKET_STREAM_DATA_FAIL) {
            stream.emit('data', payload);
        }
    };

    return {
        stream,
        handler,
    };
}

export class WebSocketWriteStream<ITransportProtocol> extends tsee.EventEmitter<StreamWritableEvents> {
    constructor(
        public readonly ws: WebSocket,
        public readonly opts: WriteOpts,
    ) {
        super();
        this.packer = opts.pack || defaultWebSocketStreamDataPacker;
    }

    readonly packer: (payload: any) => any;

    write(chunk: ITransportProtocol, callback?: Function): boolean;
    write(chunk: ITransportProtocol, stringEncoding?: string, callback?: Function): boolean;
    write(chunk: ITransportProtocol, stringEncoding_callback?: string|Function, callback?: Function): boolean {
        if (typeof stringEncoding_callback === 'function') {
            callback = stringEncoding_callback;
        }

        const data = this.packer(chunk);
        this.ws.send(data);

        if (callback) callback();

        return true;
    }
}

export function createWebSocketWriteStream(
    ws: WebSocket,
    opts: WriteOpts = {},
): IStreamWritable<ITransportProtocol> {
    return new WebSocketWriteStream(ws, opts);
}
