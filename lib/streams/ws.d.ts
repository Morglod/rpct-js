import { IStreamReadable, IStreamWritable, StreamWritableEvents } from "../streams/istream";
import * as tsee from 'tsee';
import { ITransportProtocol } from "../transports/itransport";
import WebSocket from 'ws';
export declare const WEBSOCKET_STREAM_DATA_FAIL: unique symbol;
export declare type WEBSOCKET_STREAM_DATA_FAIL = typeof WEBSOCKET_STREAM_DATA_FAIL;
/** returns message's payload or WEBSOCKET_STREAM_DATA_FAIL if it's not this protocol message */
export declare function defaultWebSocketStreamDataUnpacker(evt: WebSocket.MessageEvent): ITransportProtocol | WEBSOCKET_STREAM_DATA_FAIL;
/** returns message's data with packed payload */
export declare function defaultWebSocketStreamDataPacker(payload: ITransportProtocol): any;
declare type ReadOpts = {
    /** pick payload from protocol or return WEBSOCKET_STREAM_DATA_FAIL */
    unpack?: (evt: WebSocket.MessageEvent) => ITransportProtocol | WEBSOCKET_STREAM_DATA_FAIL;
};
declare type WriteOpts = {
    /** save payload to protocol */
    pack?: (payload: any) => any;
};
export declare function createWebSocketReadStream(ws: WebSocket, opts?: ReadOpts): {
    stream: IStreamReadable<ITransportProtocol>;
    disposer: () => void;
};
export declare function createWebSocketReadStreamHandler(opts?: ReadOpts): {
    stream: IStreamReadable<ITransportProtocol>;
    handler: (evt: WebSocket.MessageEvent) => void;
};
export declare class WebSocketWriteStream<ITransportProtocol> extends tsee.EventEmitter<StreamWritableEvents> {
    readonly ws: WebSocket;
    readonly opts: WriteOpts;
    constructor(ws: WebSocket, opts: WriteOpts);
    readonly packer: (payload: any) => any;
    write(chunk: ITransportProtocol, callback?: Function): boolean;
    write(chunk: ITransportProtocol, stringEncoding?: string, callback?: Function): boolean;
}
export declare function createWebSocketWriteStream(ws: WebSocket, opts?: WriteOpts): IStreamWritable<ITransportProtocol>;
export {};
