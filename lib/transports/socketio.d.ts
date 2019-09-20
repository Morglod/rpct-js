import 'socket.io-client';
import { Config } from '../config';
import { ITransport, ITransportRequestHandler, ITransportProtocol, ITransportData, ITransportResponse } from '../transports/itransport';
import { TicketList } from '../utils/ticket-list';
export declare type SocketIOTransportProtocolHandler = (response: ITransportProtocol) => void;
export declare type SocketIOSocket = {
    on(eventName: string, handler: (data: any) => void): void;
    emit(eventName: string, data: any): void;
};
export declare class SocketIOTransport implements ITransport {
    constructor(socket: SocketIOSocket, config?: Config);
    request(data: ITransportData): Promise<ITransportResponse>;
    setRequestHandler(handler: ITransportRequestHandler): void;
    getRequestHandler(): ITransportRequestHandler;
    setConfig(config: Config): void;
    private requestHandler;
    readonly socket: SocketIOSocket;
    config: Readonly<Config>;
    eventName: string;
    pending: TicketList<ITransportProtocol>;
}
