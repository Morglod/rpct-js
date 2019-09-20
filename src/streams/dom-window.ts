import { IStreamReadable, StreamReadableEvents, IStreamWritable, StreamWritableEvents } from "./stream.types";
import * as tsee from 'tsee';
import { ITransportProtocol } from "./transport";

type DefaultWindowStreamData = {
    type: '_$_rpct-window-stream_$_',
    payload: ITransportProtocol,
};

export const WINDOW_STREAM_DATA_FAIL = Symbol('WINDOW_STREAM_DATA_FAIL');
export type WINDOW_STREAM_DATA_FAIL = typeof WINDOW_STREAM_DATA_FAIL;

/** returns message's payload or WINDOW_STREAM_DATA_FAIL if it's not this protocol message */
export function defaultWindowStreamDataUnpacker(evt: MessageEvent): ITransportProtocol|WINDOW_STREAM_DATA_FAIL {
    try {
        const val = JSON.parse(evt.data) as DefaultWindowStreamData;
        if (typeof val === 'object' && val.type === '_$_rpct-window-stream_$_' && ('payload' in val)) {
            return val.payload;
        }
    } catch { }
    return WINDOW_STREAM_DATA_FAIL;
}

/** returns message's data with packed payload */
export function defaultWindowStreamDataPacker(payload: ITransportProtocol): any {
    const msg: DefaultWindowStreamData = {
        type: '_$_rpct-window-stream_$_',
        payload,
    };

    const data = JSON.stringify(msg);
    return data;
}

type ReadOpts = {
    /** pick payload from protocol or return WINDOW_STREAM_DATA_FAIL */
    unpack?: (evt: MessageEvent) => ITransportProtocol|WINDOW_STREAM_DATA_FAIL,
};

type WriteOpts = {
    /** save payload to protocol */
    pack?: (payload: any) => any,
    targetOrigin?: string,
};

export function createWindowReadStream(
    window: Window,
    opts: ReadOpts = {},
): {
    stream: IStreamReadable<ITransportProtocol>,
    disposer: () => void,
 } {
    const {
        stream,
        handler,
    } = createWindowReadStreamHandler(opts);
    
    window.addEventListener('message', handler);
    const disposer = () => {
        window.removeEventListener('message', handler);
    };

    return {
        stream,
        disposer,
    };
}

export function createWindowReadStreamHandler(
    opts: ReadOpts = {},
): {
    stream: IStreamReadable<ITransportProtocol>,
    handler: (evt: MessageEvent) => void,
 } {
    const {
        unpack = defaultWindowStreamDataUnpacker,
    } = opts;

    const stream = new tsee.EventEmitter<StreamReadableEvents<ITransportProtocol>>();

    const handler = (evt: MessageEvent) => {
        const payload = unpack(evt);
        if (payload !== WINDOW_STREAM_DATA_FAIL) {
            stream.emit('data', payload);
        }
    };

    return {
        stream,
        handler,
    };
}

export class WindowWriteStream<ITransportProtocol> extends tsee.EventEmitter<StreamWritableEvents> {
    constructor(
        public readonly window: Window,
        public readonly opts: WriteOpts,
    ) {
        super();
        this.packer = opts.pack || defaultWindowStreamDataPacker;
        this.targetOrigin = opts.targetOrigin || '*';
    }

    readonly packer: (payload: any) => any;
    readonly targetOrigin: string;

    write(chunk: ITransportProtocol, callback?: Function): boolean;
    write(chunk: ITransportProtocol, stringEncoding?: string, callback?: Function): boolean;
    write(chunk: ITransportProtocol, stringEncoding_callback?: string|Function, callback?: Function): boolean {
        if (typeof stringEncoding_callback === 'function') {
            callback = stringEncoding_callback;
        }

        const data = this.packer(chunk);
        this.window.postMessage(data, this.targetOrigin);

        if (callback) callback();

        return true;
    }
}

export function createWindowWriteStream(
    window: Window,
    opts: WriteOpts = {},
): IStreamWritable<ITransportProtocol> {
    return new WindowWriteStream(window, opts);
}
