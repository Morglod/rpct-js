import WebSocket from 'ws';
import { ITransport } from '../transports/itransport';
import { createWebSocketWriteStream, createWebSocketReadStream } from '../streams/ws';
import { StreamTransport } from '../bundles/browser';

export function connectWS(ws: WebSocket): ITransport;
export function connectWS(url: string, opts?: WebSocket.ClientOptions): ITransport;
export function connectWS(url_ws: WebSocket|string, opts?: WebSocket.ClientOptions): ITransport {
    let ws: WebSocket;

    if (typeof url_ws === 'string') {
        ws = new WebSocket(url_ws, opts);
    } else {
        ws = url_ws;
    }
    
    const { stream: rstream, disposer: rdisposer } = createWebSocketReadStream(ws);
    const wstream = createWebSocketWriteStream(ws);

    return new StreamTransport(rstream, wstream);
}