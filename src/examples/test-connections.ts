import { DuplexJsonStreamTransport } from "../transports/duplex-json-stream";
import { asDuplexStream } from "../streams/istream";

import * as net from 'net';
import { messagePackTransforms } from "./message-pack-transform";
import { StreamTransport } from "../transports/stream";
const jsonStream = require('duplex-json-stream');

export async function connectToJsonSocket(socketPath: string): Promise<DuplexJsonStreamTransport> {
    return new Promise(resolve => {
        const conn = net.connect(socketPath, async () => {
            const chain = jsonStream(conn);

            const localStreamTransport = new DuplexJsonStreamTransport(asDuplexStream(chain), undefined, 'local');

            resolve(localStreamTransport);
        }).on('error', err => {
            console.log('failed connect');
            console.error(err);
        });;
    })
}

export async function createJsonSocketServer(socketPath: string, onConnection: (transport: DuplexJsonStreamTransport) => void) {
    return new Promise(resolve => {
        const srv = net.createServer(socket => {
            const chain = jsonStream(socket);
            const remoteStreamTransport = new DuplexJsonStreamTransport(asDuplexStream(chain), undefined, 'remote');
            onConnection(remoteStreamTransport);
        }).listen(socketPath, () => {
            console.log('server listening');
            resolve(srv);
        }).on('error', err => {
            console.log('failed createServer');
            console.error(err);
        });
    });
}

export async function connectToMsgPackSocket(socketPath: string): Promise<StreamTransport> {
    return new Promise(resolve => {
        const conn = net.connect(socketPath, async () => {
            const {encodeStream, decodeStream} = messagePackTransforms();
    
            const readable = conn.pipe(decodeStream);
            const writable = encodeStream;
            writable.pipe(conn);
    
            const localStreamTransport = new StreamTransport(readable, writable, undefined, 'local');

            resolve(localStreamTransport);
        }).on('error', err => {
            console.log('failed connect');
            console.error(err);
        });;
    })
}

export async function createMsgPackSocketServer(socketPath: string, onConnection: (transport: StreamTransport) => void) {
    return new Promise(resolve => {
        const srv = net.createServer(socket => {
            const {encodeStream, decodeStream} = messagePackTransforms();
    
            const readable = socket.pipe(decodeStream);
            const writable = encodeStream;
            writable.pipe(socket);
    
            const remoteStreamTransport = new StreamTransport(readable, writable, undefined, 'remote');
            onConnection(remoteStreamTransport);
        }).listen(socketPath, () => {
            console.log('server listening');
            resolve(srv);
        }).on('error', err => {
            console.log('failed createServer');
            console.error(err);
        });
    });
}

export async function crossJsonSocket(socketPath: string): Promise<{
    clientStream: DuplexJsonStreamTransport,
    serverConStream: DuplexJsonStreamTransport,
}> {
    return new Promise(resolve => {
        const handleConnection = async (transport: DuplexJsonStreamTransport) => {
            const client = await clientPromise;
            resolve({
                clientStream: client,
                serverConStream: transport,
            })
        };
        createJsonSocketServer(socketPath, handleConnection);
        const clientPromise = connectToJsonSocket(socketPath);
    });
}

export async function crossMsgPackSocket(socketPath: string): Promise<{
    clientStream: StreamTransport,
    serverConStream: StreamTransport,
}> {
    return new Promise(resolve => {
        const handleConnection = async (transport: StreamTransport) => {
            const client = await clientPromise;
            resolve({
                clientStream: client,
                serverConStream: transport,
            })
        };
        createMsgPackSocketServer(socketPath, handleConnection);
        const clientPromise = connectToMsgPackSocket(socketPath);
    });
}