import { IStreamReadable, IStreamWritable, StreamWritableEvents } from "./stream.types";
import * as tsee from 'tsee';
import { ITransportProtocol } from "./transport";
export declare const WINDOW_STREAM_DATA_FAIL: unique symbol;
export declare type WINDOW_STREAM_DATA_FAIL = typeof WINDOW_STREAM_DATA_FAIL;
/** returns message's payload or WINDOW_STREAM_DATA_FAIL if it's not this protocol message */
export declare function defaultWindowStreamDataUnpacker(evt: MessageEvent): ITransportProtocol | WINDOW_STREAM_DATA_FAIL;
/** returns message's data with packed payload */
export declare function defaultWindowStreamDataPacker(payload: ITransportProtocol): any;
declare type ReadOpts = {
    /** pick payload from protocol or return WINDOW_STREAM_DATA_FAIL */
    unpack?: (evt: MessageEvent) => ITransportProtocol | WINDOW_STREAM_DATA_FAIL;
};
declare type WriteOpts = {
    /** save payload to protocol */
    pack?: (payload: any) => any;
    targetOrigin?: string;
};
export declare function createWindowReadStream(window: Window, opts?: ReadOpts): {
    stream: IStreamReadable<ITransportProtocol>;
    disposer: () => void;
};
export declare function createWindowReadStreamHandler(opts?: ReadOpts): {
    stream: IStreamReadable<ITransportProtocol>;
    handler: (evt: MessageEvent) => void;
};
export declare class WindowWriteStream<ITransportProtocol> extends tsee.EventEmitter<StreamWritableEvents> {
    readonly window: Window;
    readonly opts: WriteOpts;
    constructor(window: Window, opts: WriteOpts);
    readonly packer: (payload: any) => any;
    readonly targetOrigin: string;
    write(chunk: ITransportProtocol, callback?: Function): boolean;
    write(chunk: ITransportProtocol, stringEncoding?: string, callback?: Function): boolean;
}
export declare function createWindowWriteStream(window: Window, opts?: WriteOpts): IStreamWritable<ITransportProtocol>;
export {};
