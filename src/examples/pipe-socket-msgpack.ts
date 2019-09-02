import * as net from 'net';
import * as path from 'path';

import { Api } from "../api";
import { StreamTransport } from "../stream.transport";
import { messagePackTransforms } from './message-pack-transform';

const SOCKET_PATH = path.join('\\\\?\\pipe', process.cwd(), 'myctl');

type ApiDefinition = {
    remoteSum(
        a: number,
        b: number,
        sumResult: (result: number) => string,
        mulResult: (result: number) => string,
        powResult: (result: number) => string,
    ): string;
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
        const localApi = new Api<ApiDefinition, {}>({}, localStreamTransport, undefined, 'local');
    
        const word = await localApi.callMethod(
            'remoteSum',
            10,
            20,
            sumResult => {
                console.log('sumResult:', sumResult);
                return 'hell';
            },
            mulResult => {
                console.log('mulResult:', mulResult);
                return 'o w';
            },
            powResult => {
                console.log('powResult:', powResult);
                return 'orld';
            },
        );

        console.log(word);
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
            async remoteSum(a: number, b: number, sum, mul, pow) {
                console.log(`remoteSum(${a}, ${b})`);
                const word1 = await sum(a + b);
                const word2 = await mul(a * b);
                const word3 = await pow(a ** b);
                return word1 + word2 + word3;
            },
        }, remoteStreamTransport, undefined, 'remote');
    
    }).listen(SOCKET_PATH, () => {
        console.log('server listening');
    }).on('error', err => {
        console.log('failed createServer');
        console.error(err);
    });
}
