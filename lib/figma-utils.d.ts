import * as tsee from 'tsee';
import { StreamWritableEvents } from './stream.types';
export declare class FigmaPluginWriteStream<ITransportProtocol> extends tsee.EventEmitter<StreamWritableEvents> {
    readonly figma: {
        ui: {
            postMessage(data: any): void;
        };
    };
    constructor(figma: {
        ui: {
            postMessage(data: any): void;
        };
    });
    write(chunk: ITransportProtocol, callback?: Function): boolean;
    write(chunk: ITransportProtocol, stringEncoding?: string, callback?: Function): boolean;
}
