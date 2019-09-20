import { EventEmitter } from 'tsee';
import { StreamWritableEvents } from '../stream.types';

export class FigmaPluginWriteStream<ITransportProtocol> extends EventEmitter<StreamWritableEvents> {
    constructor(
        public readonly figma: { ui: { postMessage(data:any): void }}
    ) {
        super();
    }

    write(chunk: ITransportProtocol, callback?: Function): boolean;
    write(chunk: ITransportProtocol, stringEncoding?: string, callback?: Function): boolean;
    write(chunk: ITransportProtocol, stringEncoding_callback?: string|Function, callback?: Function): boolean {
        if (typeof stringEncoding_callback === 'function') {
            callback = stringEncoding_callback;
        }

        this.figma.ui.postMessage(chunk);

        if (callback) callback();

        return true;
    }
}