import * as net from 'net';
import * as path from 'path';

import { Api } from "../api";
import { StreamTransport } from "../transports/stream";
import { messagePackTransforms } from './message-pack-transform';

const WINDOWS = 0;
const SOCKET_PATH = WINDOWS ? path.join('\\\\?\\pipe', process.cwd(), 'myctl') : './test-socket';

type ApiDefinition = {
    ping(
        pong: (
            ping: (
                pong: (str: string) => Promise<string>,
            ) => void,
        ) => void,
    ): void;
};

(function main() {
    // DefaultConfig.debug = true;
    server().once('listening', () => {
        client();
    });
})();

function client() {
    const conn = net.connect(SOCKET_PATH);
    conn.once('connect', async () => {
        const {encodeStream, decodeStream} = messagePackTransforms();

        const readable = conn.pipe(decodeStream);
        const writable = encodeStream;
        writable.pipe(conn);

        const localStreamTransport = new StreamTransport(readable, writable, undefined, 'local');
        const localApi = new Api<ApiDefinition, {}>({}, localStreamTransport, {
            debugName: 'local'
        });
    
        localApi.callMethod(
            'ping',
            (pong) => {
                pong(async (str) => {
                    return str + ' world';
                })
            }
        );

    }).on('error', err => {
        console.log('failed connect');
        console.error(err);
    });

    return conn;
}

function server() {
    return net.createServer(socket => {
        const {encodeStream, decodeStream} = messagePackTransforms();

        const readable = socket.pipe(decodeStream);
        const writable = encodeStream;
        writable.pipe(socket);

        const remoteStreamTransport = new StreamTransport(readable, writable, undefined, 'remote');
        const remoteApi = new Api<{}, ApiDefinition>({
            ping(pong) {
                pong(async (ping2) => {
                    const r = ping2('hello');
                    console.log(await r);
                })
            }
        }, remoteStreamTransport, {
            debugName: 'remote'
        });
    
    }).listen(SOCKET_PATH, () => {
        console.log('server listening');
    }).on('error', err => {
        console.log('failed createServer');
        console.error(err);
    });
}
