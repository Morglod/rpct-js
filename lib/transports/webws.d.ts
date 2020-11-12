import { Config } from '../config';
import { ITransport, ITransportRequestHandler, ITransportProtocol, ITransportData, ITransportResponse } from './itransport';
import { TicketList } from '../utils/ticket-list';
export declare type WebWSTransportProtocolHandler = (response: ITransportProtocol) => void;
export declare type WebWSSocket = {
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    addEventListener(type: 'message', listener: (event: {
        data: any;
    }) => any): void;
};
export declare class WebWSTransport implements ITransport {
    debugName: string;
    constructor(socket: WebWSSocket, config?: Config, debugName?: string);
    request(data: ITransportData): Promise<ITransportResponse>;
    setRequestHandler(handler: ITransportRequestHandler): void;
    getRequestHandler(): ITransportRequestHandler;
    setConfig(config: Config): void;
    private requestHandler;
    readonly socket: WebWSSocket;
    config: Readonly<Config>;
    pending: TicketList<ITransportResponse>;
}
