import WebSocket from 'ws';
import { ITransport } from '../transports/itransport';
export declare function connectWS(ws: WebSocket): ITransport;
export declare function connectWS(url: string, opts?: WebSocket.ClientOptions): ITransport;
